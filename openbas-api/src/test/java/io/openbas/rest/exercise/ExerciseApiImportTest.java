package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.rest.exercise.exports.ExportOptions;
import io.openbas.rest.exercise.service.ExportService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.persistence.EntityManager;
import java.util.Optional;
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
  @Autowired private DocumentRepository documentRepository;

  @Autowired private TeamRepository teamRepository;
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
  @Autowired private EntityManager entityManager;

  private static final int DEFAULT_EXPORT_OPTIONS = ExportOptions.mask(false, false, false);
  private static final int FULL_EXPORT_OPTIONS = ExportOptions.mask(true, true, true);

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

  private ExerciseComposer.Composer getExercise() {
    return exerciseComposer
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
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Team tag")))
                .withUser(
                    userComposer
                        .forUser(UserFixture.getUser())
                        .withTag(tagComposer.forTag(TagFixture.getTagWithText("User tag")))
                        .withOrganization(
                            organizationComposer
                                .forOrganization(OrganizationFixture.createOrganization())
                                .withTag(
                                    tagComposer.forTag(
                                        TagFixture.getTagWithText("Organization tag"))))))
        .withTeamUsers()
        .withInject(
            injectComposer
                .forInject(InjectFixture.getInjectWithoutContract())
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Inject tag")))
                .withChallenge(
                    challengeComposer
                        .forChallenge(ChallengeFixture.createDefaultChallenge())
                        .withTag(tagComposer.forTag(TagFixture.getTagWithText("Challenge tag")))))
        .withDocument(
            documentComposer
                .forDocument(DocumentFixture.getDocumentTxt(FileFixture.getPlainTextFileContent()))
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Document tag")))
                .withInMemoryFile(FileFixture.getPlainTextFileContent()))
        .withObjective(objectiveComposer.forObjective(ObjectiveFixture.getObjective()))
        .withTag(tagComposer.forTag(TagFixture.getTagWithText("Exercise tag")))
        .withVariable(variableComposer.forVariable(VariableFixture.getVariable()));
  }

  @DisplayName("Given a valid export zip file, all objects created as expected")
  @Test
  @WithMockAdminUser
  public void testImport() throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    Exercise exercise = exerciseWrapper.persist().get();
    byte[] zipBytes = exportService.exportExerciseToZip(exercise, FULL_EXPORT_OPTIONS);
    exerciseWrapper.delete();

    MockMultipartFile mmf = new MockMultipartFile("file", zipBytes);

    mvc.perform(
            multipart(EXERCISE_URI + "/import")
                .file(mmf)
                .contentType(MediaType.MULTIPART_FORM_DATA))
        .andExpect(status().is2xxSuccessful());

    // force hibernate to clear its cache to not pollute fetch operations
    // TODO: make this automatic somehow, perhaps within Composers
    entityManager.clear();

    Optional<Exercise> exerciseFromDb = exerciseRepository.findAll().stream().findFirst();
    if (exerciseFromDb.isEmpty()) {
      Assertions.fail();
    }
    Exercise imported = exerciseFromDb.get();

    Assertions.assertEquals(imported, exercise);
  }
}
