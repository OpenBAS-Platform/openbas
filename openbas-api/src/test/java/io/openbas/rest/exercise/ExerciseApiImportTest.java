package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.rest.exercise.exports.ExportOptions;
import io.openbas.rest.exercise.service.ExportService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(PER_CLASS)
public class ExerciseApiImportTest extends IntegrationTest {
  @Autowired private MockMvc mvc;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private ExerciseRepository exerciseRepository;
  @Autowired private ArticleComposer articleComposer;
  @Autowired private ChannelComposer channelComposer;
  @Autowired private LessonsQuestionsComposer lessonsQuestionsComposer;
  @Autowired private LessonsCategoryComposer lessonsCategoryComposer;
  @Autowired private VariableComposer variableComposer;
  @Autowired private TeamComposer teamComposer;
  @Autowired private UserComposer userComposer;
  @Autowired private OrganizationComposer organizationComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private ChallengeComposer challengeComposer;
  @Autowired private ObjectiveComposer objectiveComposer;
  @Autowired private DocumentComposer documentComposer;
  @Autowired private TagComposer tagComposer;
  @Autowired private ExportService exportService;

  private static int DEFAULT_EXPORT_OPTIONS = ExportOptions.mask(false, false, false);

  @BeforeEach
  void before() {
    lessonsQuestionsComposer.reset();
    lessonsCategoryComposer.reset();
    teamComposer.reset();
    userComposer.reset();
    variableComposer.reset();
    organizationComposer.reset();
    injectComposer.reset();
    challengeComposer.reset();
    channelComposer.reset();
    articleComposer.reset();
    objectiveComposer.reset();
    documentComposer.reset();
    tagComposer.reset();
    exerciseComposer.reset();
  }

  private Exercise getExercise() {
    return exerciseComposer
        .forExercise(ExerciseFixture.createDefaultCrisisExercise())
        .withId(UUID.randomUUID().toString())
        .withArticle(
            articleComposer
                .forArticle(ArticleFixture.getArticleNoChannel())
                .withId(UUID.randomUUID().toString())
                .withChannel(channelComposer.forChannel(ChannelFixture.getChannel())))
        .withLessonCategory(
            lessonsCategoryComposer
                .forLessonsCategory(LessonsCategoryFixture.createLessonCategory())
                .withId(UUID.randomUUID().toString())
                .withLessonsQuestion(
                    lessonsQuestionsComposer
                        .forLessonsQuestion(LessonsQuestionFixture.createLessonsQuestion())
                        .withId(UUID.randomUUID().toString())))
        .withTeam(
            teamComposer
                .forTeam(TeamFixture.getEmptyTeam())
                .withId(UUID.randomUUID().toString())
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Team tag")))
                .withUser(
                    userComposer
                        .forUser(UserFixture.getUser())
                        .withId(UUID.randomUUID().toString())
                        .withTag(tagComposer.forTag(TagFixture.getTagWithText("User tag")))
                        .withOrganization(
                            organizationComposer
                                .forOrganization(OrganizationFixture.createOrganization())
                                .withId(UUID.randomUUID().toString())
                                .withTag(
                                    tagComposer.forTag(
                                        TagFixture.getTagWithText("Organization tag"))))))
        .withTeamUsers()
        .withInject(
            injectComposer
                .forInject(InjectFixture.getInjectWithoutContract())
                .withId(UUID.randomUUID().toString())
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Inject tag")))
                .withChallenge(
                    challengeComposer
                        .forChallenge(ChallengeFixture.createDefaultChallenge())
                        .withId(UUID.randomUUID().toString())
                        .withTag(tagComposer.forTag(TagFixture.getTagWithText("Challenge tag")))))
        .withDocument(
            documentComposer
                .forDocument(DocumentFixture.getDocumentJpeg())
                .withId(UUID.randomUUID().toString())
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Document tag"))))
        .withObjective(
            objectiveComposer
                .forObjective(ObjectiveFixture.getObjective())
                .withId(UUID.randomUUID().toString()))
        .withTag(
            tagComposer
                .forTag(TagFixture.getTagWithText("Exercise tag"))
                .withId(UUID.randomUUID().toString()))
        .withVariable(
            variableComposer
                .forVariable(VariableFixture.getVariable())
                .withId(UUID.randomUUID().toString()))
        .get();
  }

  @DisplayName("Given a valid export zip file, all objects created as expected")
  @Test
  @WithMockAdminUser
  public void testImport() throws Exception {
    Exercise exercise = getExercise();
    byte[] zipBytes = exportService.exportExerciseToZip(exercise, DEFAULT_EXPORT_OPTIONS);

    MockMultipartFile mmf = new MockMultipartFile("export.zip", zipBytes);

    mvc.perform(
            multipart(EXERCISE_URI + "/import")
                .file(mmf)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().is2xxSuccessful());

    Assertions.assertEquals(exerciseRepository.findById(exercise.getId()), exercise);
  }
}
