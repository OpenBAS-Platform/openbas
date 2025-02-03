package io.openbas.rest.inject;

import static io.openbas.rest.inject.InjectApi.INJECT_URI;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Document;
import io.openbas.database.model.Inject;
import io.openbas.rest.exercise.exports.ExerciseExportMixins;
import io.openbas.rest.inject.form.InjectExportRequestInput;
import io.openbas.rest.inject.form.InjectExportTarget;
import io.openbas.utils.ZipUtils;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@DisplayName("Inject JSON export tests")
public class InjectExportTest extends IntegrationTest {

  public final String INJECT_EXPORT_URI = INJECT_URI + "/export";

  @Autowired private InjectComposer injectComposer;
  @Autowired private DocumentComposer documentComposer;
  @Autowired private InjectorContractComposer injectorContractComposer;
  @Autowired private ChallengeComposer challengeComposer;
  @Autowired private TagComposer tagComposer;
  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper mapper;

  @Nested
  @DisplayName("Without authorisation")
  public class WithoutAuthorisation {
    @Test
    @DisplayName("When lacking authorisation, return UNAUTHORISED")
    public void whenLackingAuthorisation_returnUnauthorised() throws Exception {
      mvc.perform(post(INJECT_URI + "/export").contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isUnauthorized());
    }
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("With authorisation")
  public class WithAuthorisation {
    private List<InjectComposer.Composer> createDefaultInjectWrappers() {
      return List.of(
          // challenge inject
          injectComposer
              .forInject(InjectFixture.getDefaultInject())
              .withInjectorContract(
                  injectorContractComposer
                      .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                      .withChallenge(
                          challengeComposer
                              .forChallenge(ChallengeFixture.createDefaultChallenge())
                              .withTag(
                                  tagComposer.forTag(
                                      TagFixture.getTagWithText("Challenge inject tag"))))),
          injectComposer.forInject(InjectFixture.getDefaultInject()),
          injectComposer.forInject(InjectFixture.getDefaultInject()),
          injectComposer.forInject(InjectFixture.getDefaultInject()));
    }

    private List<InjectExportTarget> createDefaultInjectTargets() {
      List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();
      injectWrappers.forEach(InjectComposer.Composer::persist);
      List<String> persistedInjectIds = injectWrappers.stream().map(w -> w.get().getId()).toList();

      return new ArrayList<>(
          persistedInjectIds.stream()
              .map(
                  id -> {
                    InjectExportTarget tgt = new InjectExportTarget();
                    tgt.setId(id);
                    return tgt;
                  })
              .toList());
    }

    private InjectExportRequestInput createDefaultInjectExportRequestInput() {
      InjectExportRequestInput input = new InjectExportRequestInput();
      input.setInjects(createDefaultInjectTargets());
      return input;
    }

    @Test
    @DisplayName("When a single target inject is not found in the database, return NOT FOUND")
    public void whenSingleTargetInjectIsNotFound_returnNotFound() throws Exception {
      List<InjectExportTarget> targets = createDefaultInjectTargets();

      InjectExportTarget extra_target = new InjectExportTarget();
      extra_target.setId(UUID.randomUUID().toString());

      targets.add(extra_target);

      InjectExportRequestInput input = new InjectExportRequestInput();
      input.setInjects(targets);

      String responseBody =
          mvc.perform(
                  post(INJECT_EXPORT_URI)
                      .content(mapper.writeValueAsString(input))
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isNotFound())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Assertions.assertEquals("yo this broke", responseBody);
    }

    @Nested
    @DisplayName("When all injects are found")
    public class WhenAllInjectsAreFound {
      private byte[] doImport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(createDefaultInjectExportRequestInput())))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      private String getJsonExportFromZip(byte[] zipBytes, String entryName) throws IOException {
        return ZipUtils.getZipEntry(
            zipBytes, "%s.json".formatted(entryName), ZipUtils::streamToString);
      }

      @Test
      @DisplayName("When all target injects found, returned zip file contains correct json")
      public void whenAllTargetInjectsFound_returnedZipFileContainsCorrectJson() throws Exception {
        byte[] response = doImport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Inject.class, ExerciseExportMixins.Inject.class);
        String injectJson = objectMapper.writeValueAsString(injectComposer.generatedItems);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("injects").isEqualTo(injectJson);
      }

      @Test
      @DisplayName("When all target injects found, returned zip file contains document file")
      public void whenAllTargetInjectsFound_returnedZipFileContainsDocumentFile() throws Exception {
        byte[] response = doImport();

        List<Document> docs = documentComposer.generatedItems;

        for (Document document : docs) {
          try (ByteArrayInputStream fis =
              new ByteArrayInputStream(FileFixture.getPlainTextFileContent().getContentBytes())) {
            byte[] docFromZip =
                ZipUtils.getZipEntry(response, document.getTarget(), ZipUtils::streamToBytes);
            byte[] docFromDisk = fis.readAllBytes();

            Assertions.assertArrayEquals(docFromZip, docFromDisk);
          }
        }
      }
    }
  }
}
