package io.openbas.rest.inject;

import static io.openbas.rest.inject.InjectApi.INJECT_URI;
import static io.openbas.utils.fixtures.FileFixture.WELL_KNOWN_FILES;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.export.Mixins;
import io.openbas.rest.inject.form.InjectExportRequestInput;
import io.openbas.rest.inject.form.InjectExportTarget;
import io.openbas.service.FileService;
import io.openbas.utils.ZipUtils;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.helpers.GrantHelper;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.mockUser.WithMockUnprivilegedUser;
import jakarta.persistence.EntityManager;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.*;
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
  @Autowired private ArticleComposer articleComposer;
  @Autowired private ChannelComposer channelComposer;
  @Autowired private TagComposer tagComposer;
  @Autowired private UserComposer userComposer;
  @Autowired private TeamComposer teamComposer;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private ScenarioComposer scenarioComposer;
  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper mapper;
  @Autowired private FileService fileService;
  @Autowired private GrantHelper grantHelper;
  @Autowired private EntityManager entityManager;

  @BeforeEach
  public void setup() throws Exception {
    injectComposer.reset();
    documentComposer.reset();
    injectorContractComposer.reset();
    challengeComposer.reset();
    articleComposer.reset();
    channelComposer.reset();
    teamComposer.reset();
    userComposer.reset();
    tagComposer.reset();
    exerciseComposer.reset();
    scenarioComposer.reset();

    // delete the test files from the minio service
    for (String fileName : WELL_KNOWN_FILES.keySet()) {
      fileService.deleteFile(fileName);
    }
  }

  private List<InjectComposer.Composer> createDefaultInjectWrappers() {
    InjectComposer.Composer injectWithExerciseComposer =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Other inject tag")))
            .withDocument(
                documentComposer
                    .forDocument(DocumentFixture.getDocument(FileFixture.getPlainTextFileContent()))
                    .withInMemoryFile(FileFixture.getPlainTextFileContent()));
    // wrap it in a persisted exercise
    exerciseComposer
        .forExercise(ExerciseFixture.createDefaultExercise())
        .persist()
        .withInject(injectWithExerciseComposer);

    InjectComposer.Composer injectWithScenarioComposer =
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withTeam(
                teamComposer
                    .forTeam(TeamFixture.getDefaultTeam())
                    .withUser(userComposer.forUser(UserFixture.getUserWithDefaultEmail())));

    // wrap it in a persisted scenario
    scenarioComposer
        .forScenario(ScenarioFixture.getScenario())
        .persist()
        .withInject(injectWithScenarioComposer);

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
        injectComposer
            .forInject(InjectFixture.getDefaultInject())
            .withInjectorContract(
                injectorContractComposer
                    .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                    .withChallenge(
                        challengeComposer
                            .forChallenge(ChallengeFixture.createDefaultChallenge())
                            .withDocument(
                                documentComposer
                                    .forDocument(
                                        DocumentFixture.getDocument(
                                            FileFixture.getPngFileContent()))
                                    .withInMemoryFile(FileFixture.getPngFileContent())
                                    .withTag(
                                        tagComposer.forTag(
                                            TagFixture.getTagWithText("Document tag")))))),
        // this is set up above
        injectWithExerciseComposer,
        injectWithScenarioComposer);
  }

  private List<InjectExportTarget> createDefaultInjectTargets() {
    return createDefaultInjectTargets(createDefaultInjectWrappers());
  }

  private List<InjectExportTarget> createDefaultInjectTargets(
      List<InjectComposer.Composer> injectComposers) {
    injectComposers.forEach(InjectComposer.Composer::persist);
    List<String> persistedInjectIds = injectComposers.stream().map(w -> w.get().getId()).toList();

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
    return createDefaultInjectExportRequestInput(createDefaultInjectTargets());
  }

  private InjectExportRequestInput createDefaultInjectExportRequestInput(
      List<InjectExportTarget> targets) {
    InjectExportRequestInput input = new InjectExportRequestInput();
    input.setInjects(targets);
    return input;
  }

  @Nested
  @DisplayName("When unauthenticated")
  public class WhenUnauthenticated {
    @Test
    @DisplayName("Return UNAUTHORISED")
    public void whenLackingAuthorisation_returnUnauthorised() throws Exception {
      mvc.perform(post(INJECT_URI + "/export").contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isUnauthorized());
    }
  }

  @Nested
  @WithMockUnprivilegedUser
  @DisplayName("When standard user with staggered privileges")
  public class WhenStandardUserWithStaggeredPrivileges {
    @Test
    @DisplayName("When lacking OBSERVER grant on some exercises, return NOT FOUND")
    public void whenLackingOBSERVERGrantOnSomeExercisesReturnNOTFOUND() throws Exception {
      List<InjectComposer.Composer> injectWrappers = createDefaultInjectWrappers();

      // grant Observer on exercise but not the scenario
      InjectComposer.Composer injectWithExercise =
          injectWrappers.stream()
              .filter(wrapper -> wrapper.get().getExercise() != null)
              .findAny()
              .get();
      grantHelper.grantExerciseObserver(injectWithExercise.get().getExercise());

      entityManager.flush();
      entityManager.clear();

      InjectExportRequestInput input =
          createDefaultInjectExportRequestInput(createDefaultInjectTargets(injectWrappers));

      String not_found_response =
          mvc.perform(
                  post(INJECT_EXPORT_URI)
                      .content(mapper.writeValueAsString(input))
                      .contentType(MediaType.APPLICATION_JSON))
              .andExpect(status().isNotFound())
              .andReturn()
              .getResponse()
              .getContentAsString();

      List<String> expected_not_found_ids =
          injectWrappers.stream()
              .map(wrapper -> wrapper.get().getId())
              .filter(id -> !id.equals(injectWithExercise.get().getId()))
              .toList();

      assertThatJson(not_found_response)
          .node("message")
          .isEqualTo("Element not found: %s".formatted(String.join(", ", expected_not_found_ids)));
    }
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("With admin authorisation")
  public class WithAdminAuthorisation {
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

      assertThatJson(responseBody)
          .node("message")
          .isEqualTo("Element not found: %s".formatted(extra_target.getId()));
    }

    @Nested
    @DisplayName("With default export options")
    public class WithDefaultExportOptions {
      private byte[] doExport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(createDefaultInjectExportRequestInput())))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      @Test
      @DisplayName("Returned zip file contains json with correct injects")
      public void returnedZipFileContainsJsonWithCorrectInjects() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Inject.class, Mixins.Inject.class);
        String injectJson = objectMapper.writeValueAsString(injectComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_information")
            .isEqualTo(injectJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct challenges")
      public void returnedZipFileContainsJsonWithCorrectChallenges() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Challenge.class, Mixins.Challenge.class);
        String challengeJson = objectMapper.writeValueAsString(challengeComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_challenges")
            .isEqualTo(challengeJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct articles")
      public void returnedZipFileContainsJsonWithCorrectArticles() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Article.class, Mixins.Article.class);
        String articleJson = objectMapper.writeValueAsString(articleComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_articles")
            .isEqualTo(articleJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct channels")
      public void returnedZipFileContainsJsonWithCorrectChannels() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Channel.class, Mixins.Channel.class);
        String channelJson = objectMapper.writeValueAsString(channelComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_channels")
            .isEqualTo(channelJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with correct documents")
      public void returnedZipFileContainsJsonWithCorrectDocuments() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Document.class, Mixins.Document.class);
        String documentJson = objectMapper.writeValueAsString(documentComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_documents")
            .isEqualTo(documentJson);
      }

      @Test
      @DisplayName("Returned zip file contains json with empty teams key")
      public void returnedZipFileContainsJsonWithEmptyTeamsKey() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_teams").isEqualTo("[]");
      }

      @Test
      @DisplayName("Returned zip file contains json with absent users key")
      public void returnedZipFileContainsJsonWithAbsentUsersKey() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_users").isAbsent();
      }

      @Test
      @DisplayName("Returned zip file contains document files")
      public void returnedZipFileContainsDocumentFiles() throws Exception {
        byte[] response = doExport();

        for (Document document : documentComposer.generatedItems) {
          try (ByteArrayInputStream fis =
              new ByteArrayInputStream(
                  WELL_KNOWN_FILES.get(document.getTarget()).getContentBytes())) {
            byte[] docFromZip =
                ZipUtils.getZipEntry(response, document.getTarget(), ZipUtils::streamToBytes);
            byte[] docFromDisk = fis.readAllBytes();

            Assertions.assertArrayEquals(docFromZip, docFromDisk);
          }
        }
      }
    }

    @Nested
    @DisplayName("With embedded teams and not users options")
    public class WithEmbeddedTeamsExportOption {
      private byte[] doExport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .queryParam("isWithTeams", "true")
                    .content(mapper.writeValueAsString(createDefaultInjectExportRequestInput())))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      @Test
      @DisplayName("Returned teams are correct")
      public void returnedTeamsAreCorrect() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        ObjectMapper objectMapper = mapper.copy();
        objectMapper.addMixIn(Team.class, Mixins.EmptyTeam.class);
        String teamJson = objectMapper.writeValueAsString(teamComposer.generatedItems);

        assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("inject_teams")
            .isEqualTo(teamJson);
      }

      @Test
      @DisplayName("Users are absent")
      public void usersAreAbsent() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_users").isAbsent();
      }
    }

    @Nested
    @DisplayName("With embedded users and not teams options")
    public class WithEmbeddedUsersAndNotTeamsExportOption {
      private byte[] doExport() throws Exception {
        return mvc.perform(
                post(INJECT_EXPORT_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .queryParam("isWithPlayers", "true")
                    .content(mapper.writeValueAsString(createDefaultInjectExportRequestInput())))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();
      }

      @Test
      @DisplayName("Returned teams are empty")
      public void returnedTeamsAreCorrect() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_teams").isEqualTo("[]");
      }

      @Test
      @DisplayName("Returned users are empty")
      public void returnedUsersAreEmpty() throws Exception {
        byte[] response = doExport();

        String actualJson =
            ZipUtils.getZipEntry(response, "injects.json", ZipUtils::streamToString);

        assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("inject_users").isEqualTo("[]");
      }
    }
  }
}
