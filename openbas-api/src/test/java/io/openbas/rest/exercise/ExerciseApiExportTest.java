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
import io.openbas.utils.ZipUtils;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.*;
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

  @DisplayName("Given a valid simulation, the export file is found in zip and correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_the_export_file_is_found_in_zip_and_correct() throws Exception {
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + EXERCISE.getId() + "/export")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String jsonExport =
            ZipUtils.getZipEntryAsString(response, "%s.json".formatted(EXERCISE.getName()));
    ObjectMapper exportMapper = mapper.copy();
    JsonNode expectedJson =
        exportMapper.readTree(
            exportMapper.writeValueAsBytes(
                ExerciseFileExport.fromExercise(
                        EXERCISE, exportMapper, variableService, challengeService)
                    .withOptions(0)));
    JsonNode actualJson = exportMapper.readTree(jsonExport);

    Assertions.assertEquals(expectedJson, actualJson);
  }
}
