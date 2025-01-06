package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.rest.exercise.exports.ExerciseFileExport;
import io.openbas.service.ChallengeService;
import io.openbas.service.VariableService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.*;
import org.opensaml.saml.saml1.core.Assertion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(PER_CLASS)
public class ExerciseApiExportTest extends IntegrationTest {
  @Autowired private MockMvc mvc;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private ArticleComposer articleComposer;
  @Autowired private ChannelComposer channelComposer;
  @Autowired private LessonsQuestionsComposer lessonsQuestionsComposer;
  @Autowired private LessonsCategoryComposer lessonsCategoryComposer;
  @Autowired private TeamComposer teamComposer;
  @Autowired private UserComposer userComposer;
  @Autowired private OrganizationComposer organizationComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private ChallengeComposer challengeComposer;
  @Autowired private ObjectiveComposer objectiveComposer;
  @Autowired private DocumentComposer documentComposer;
  @Autowired private TagComposer tagComposer;
  @Autowired private VariableService variableService;
  @Autowired private ChallengeService challengeService;
  @Resource protected ObjectMapper mapper;

  static Exercise EXERCISE;

  @BeforeEach
  void beforeAll() {
    EXERCISE =
        exerciseComposer
            .forExercise(ExerciseFixture.createDefaultCrisisExercise())
            .withArticle(
                articleComposer
                    .forArticle(ArticleFixture.getArticleNoChannel())
                    .withChannel(channelComposer.forChannel(ChannelFixture.getChannel())))
            .withLessonCategory(
                lessonsCategoryComposer
                    .forLessonsCategory(LessonsCategoryFixture.createLessonCategory())
                    .withLessonsQuestion(
                        lessonsQuestionsComposer.forLessonsQuestion(
                            LessonsQuestionFixture.createLessonsQuestion())))
            .withTeam(
                teamComposer
                    .forTeam(TeamFixture.getEmptyTeam())
                    .withUser(
                        userComposer
                            .forUser(UserFixture.getUser())
                            .withOrganization(
                                organizationComposer.forOrganization(
                                    OrganizationFixture.createOrganization()))))
            .withInject(
                injectComposer
                    .forInject(InjectFixture.getInjectWithoutContract())
                    .withChallenge(
                        challengeComposer.forChallenge(ChallengeFixture.createDefaultChallenge())))
            .withDocument(documentComposer.forDocument(DocumentFixture.getDocumentJpeg()))
            .withObjective(objectiveComposer.forObjective(ObjectiveFixture.getObjective()))
            .withTag(tagComposer.forTag(TagFixture.getTag()))
            .persist()
            .get();
  }

  @Test
  @WithMockAdminUser
  public void test_export() throws Exception {
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + EXERCISE.getId() + "/export")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String jsonExport = getZipEntryAsStringFromByteArrayByName(response, "%s.json".formatted(EXERCISE.getName()));
    ObjectMapper exportMapper = mapper.copy();
    JsonNode expectedJson = exportMapper.readTree(
            exportMapper.writeValueAsBytes(
                    ExerciseFileExport.fromExercise(EXERCISE, exportMapper, variableService, challengeService)
                            .withOptions(0)));
    JsonNode actualJson = exportMapper.readTree(jsonExport);

    Assertions.assertEquals(expectedJson, actualJson);
  }

  // looks for a specific entry in a zip buffer by name, and returns a string representation of it
  // ensure you are using this for text files within zips, not binary files
  private String getZipEntryAsStringFromByteArrayByName(byte[] byteArray, String entryName) throws IOException {
    try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(byteArray))) {
      ZipEntry entry;
      while ((entry = zis.getNextEntry()) != null) {
        if (entry.getName().equals(entryName)) {
          StringBuilder sb = new StringBuilder();
          byte[] buffer = new byte[1024];
          int read = 0;
          while ((read = zis.read(buffer, 0, 1024)) >= 0) {
            sb.append(new String(buffer, 0, read));
          }
          // force exit of test since we have found the correct entry
          return sb.toString();
        }
      }
      // no zip entry corresponding to expected json
      throw new IOException("Zip entry '%s' not found".formatted(entryName));
    }
  }
}
