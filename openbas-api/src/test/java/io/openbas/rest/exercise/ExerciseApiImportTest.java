package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.exports.ExportOptions;
import io.openbas.rest.exercise.service.ExportService;
import io.openbas.service.ChallengeService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.helpers.ExerciseHelper;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.StreamSupport;
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
  @Autowired private VariableComposer variableComposer;
  @Autowired private VariableRepository variableRepository;
  @Autowired private TeamComposer teamComposer;
  @Autowired private TeamRepository teamRepository;
  @Autowired private UserComposer userComposer;
  @Autowired private UserRepository userRepository;
  @Autowired private OrganizationComposer organizationComposer;
  @Autowired private OrganizationRepository organizationRepository;
  @Autowired private InjectComposer injectComposer;
  @Autowired private InjectRepository injectRepository;
  @Autowired private ChallengeComposer challengeComposer;
  @Autowired private ChallengeRepository challengeRepository;
  @Autowired private ObjectiveComposer objectiveComposer;
  @Autowired private ObjectiveRepository objectiveRepository;
  @Autowired private DocumentComposer documentComposer;
  @Autowired private DocumentRepository documentRepository;
  @Autowired private TagComposer tagComposer;
  @Autowired private TagRepository tagRepository;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private ExerciseRepository exerciseRepository;
  @Autowired private ArticleComposer articleComposer;
  @Autowired private ArticleRepository articleRepository;
  @Autowired private ChannelComposer channelComposer;
  @Autowired private ChannelRepository channelRepository;
  @Autowired private LessonsQuestionsComposer lessonsQuestionsComposer;
  @Autowired private LessonsQuestionRepository lessonsQuestionRepository;
  @Autowired private LessonsCategoryComposer lessonsCategoryComposer;
  @Autowired private LessonsCategoryRepository lessonsCategoryRepository;
  @Autowired private ExportService exportService;
  @Autowired private EntityManager entityManager;
  @Autowired private ChallengeService challengeService;

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
                    userComposer.forUser(
                        UserFixture.getUser("Ferdinand", "Salsifitte", "tutu@filigran.io")))
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

  private Exercise findSingleExerciseFromDb() {
    Optional<Exercise> exerciseOpt = exerciseRepository.findAll().stream().findFirst();
    if (exerciseOpt.isEmpty()) {
      Assertions.fail("No exercise found");
    }
    return exerciseOpt.get();
  }

  private byte[] doExport(ExerciseComposer.Composer composer) throws Exception {
    Exercise exercise = composer.persist().get();
    byte[] zipBytes = exportService.exportExerciseToZip(exercise, FULL_EXPORT_OPTIONS);
    return zipBytes;
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, exercise imported correctly")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_exercise_imported_correctly()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    Exercise imported = findSingleExerciseFromDb();
    Exercise expected = exerciseWrapper.get();

    Assertions.assertEquals(expected.getName() + " (Import)", imported.getName());
    Assertions.assertEquals(expected.getDescription(), imported.getDescription());
    Assertions.assertEquals(expected.getStatus(), imported.getStatus());
    Assertions.assertEquals(expected.getSubtitle(), imported.getSubtitle());
    Assertions.assertEquals(expected.getHeader(), imported.getHeader());
    Assertions.assertEquals(expected.getFooter(), imported.getFooter());
    Assertions.assertEquals(expected.getFrom(), imported.getFrom());

    Assertions.assertNotEquals(expected.getId(), imported.getId());
  }

  @DisplayName("Given a valid export zip file, given no preexisting objects, create new teams")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_teams()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Team expected : teamComposer.generatedItems) {
      Optional<Team> teamFromDb =
          teamRepository.findAllByNameIgnoreCase(expected.getName()).stream().findFirst();
      if (teamFromDb.isEmpty()) {
        Assertions.fail("Team " + expected.getName() + " not found");
      }
      Team imported = teamFromDb.get();

      Assertions.assertEquals(expected.getName(), imported.getName());
      Assertions.assertEquals(expected.getDescription(), imported.getDescription());

      Assertions.assertNotEquals(expected.getId(), imported.getId());
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new teams attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_teams_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Team expected : exerciseWrapper.get().getTeams()) {
      Assertions.assertTrue(
          findSingleExerciseFromDb().getTeams().stream()
              .anyMatch(team -> team.getName().equals(expected.getName())),
          "Team %s not found in imported exercise".formatted(expected.getName()));
    }
  }

  @DisplayName("Given a valid export zip file, given no preexisting objects, create new users")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_users()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (User expected : userComposer.generatedItems) {
      Optional<User> userFromDb =
          userRepository.findByEmailIgnoreCase(expected.getEmail()).stream().findFirst();
      if (userFromDb.isEmpty()) {
        Assertions.fail("User %s not found".formatted(expected.getName()));
      }
      User imported = userFromDb.get();
      List<User> usersFromExercise =
          findSingleExerciseFromDb().getTeams().stream()
              .flatMap(team -> team.getUsers().stream())
              .toList();

      Assertions.assertEquals(expected.getName(), imported.getName());
      Assertions.assertEquals(expected.getFirstname(), imported.getFirstname());
      Assertions.assertEquals(expected.getLastname(), imported.getLastname());
      Assertions.assertEquals(expected.getLang(), imported.getLang());
      Assertions.assertEquals(expected.getEmail(), imported.getEmail());
      Assertions.assertEquals(expected.getPhone(), imported.getPhone());
      Assertions.assertEquals(expected.getPgpKey(), imported.getPgpKey());
      Assertions.assertEquals(expected.getCountry(), imported.getCountry());
      Assertions.assertEquals(expected.getCity(), imported.getCity());

      Assertions.assertNotEquals(expected.getId(), imported.getId());
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new users attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_users_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (User expected : userComposer.generatedItems) {
      Assertions.assertTrue(
          findSingleExerciseFromDb().getTeams().stream()
              .flatMap(team -> team.getUsers().stream())
              .toList()
              .stream()
              .anyMatch(userFromDb -> userFromDb.getEmail().equals(expected.getEmail())));
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, create new organisations")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_organisations()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Organization expected : organizationComposer.generatedItems) {
      Optional<Organization> orgFromDb =
          organizationRepository.findByNameIgnoreCase(expected.getName()).stream().findFirst();
      if (orgFromDb.isEmpty()) {
        Assertions.fail("Organization " + expected.getName() + " not found");
      }
      Organization imported = orgFromDb.get();

      Assertions.assertEquals(expected.getName(), imported.getName());
      Assertions.assertEquals(expected.getDescription(), imported.getDescription());

      Assertions.assertNotEquals(expected.getId(), imported.getId());
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new organisations attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_organisations_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Organization expected : organizationComposer.generatedItems) {
      Assertions.assertTrue(
          findSingleExerciseFromDb().getTeams().stream()
              .flatMap(team -> team.getUsers().stream().map(User::getOrganization))
              .filter(Objects::nonNull)
              .anyMatch(o -> o.getName().equals(expected.getName())),
          "Expected organization " + expected.getName() + " not found");
    }
  }

  @DisplayName("Given a valid export zip file, given no preexisting objects, create new articles")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_articles()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Article expected : articleComposer.generatedItems) {
      Optional<Article> articleFromDb =
          articleRepository
              .findAll(
                  (root, query, criteriaBuilder) ->
                      criteriaBuilder.equal(root.get("name"), expected.getName()))
              .stream()
              .findFirst();
      if (articleFromDb.isEmpty()) {
        Assertions.fail("Article " + expected.getName() + " not found");
      }
      Article imported = articleFromDb.get();

      Assertions.assertEquals(expected.getName(), imported.getName());
      Assertions.assertEquals(expected.getContent(), imported.getContent());
      Assertions.assertEquals(expected.getShares(), imported.getShares());
      Assertions.assertEquals(expected.getAuthor(), imported.getAuthor());
      Assertions.assertEquals(expected.getLikes(), imported.getLikes());
      Assertions.assertEquals(expected.getComments(), imported.getComments());

      Assertions.assertNotEquals(expected.getId(), imported.getId());
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new articles attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_articles_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Article expected : articleComposer.generatedItems) {
      Assertions.assertTrue(
          findSingleExerciseFromDb().getArticles().stream()
              .anyMatch(art -> art.getName().equals(expected.getName())),
          "Article " + expected.getName() + " not found in imported exercise");
    }
  }

  @DisplayName("Given a valid export zip file, given no preexisting objects, create new channels")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_channels()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    Channel expected = channelComposer.generatedItems.getFirst();
    Optional<Channel> channelFromDb =
        channelRepository
            .findAll(
                (root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("name"), expected.getName()))
            .stream()
            .findFirst();
    if (channelFromDb.isEmpty()) {
      Assertions.fail();
    }
    Channel imported = channelFromDb.get();

    Assertions.assertEquals(expected.getName(), imported.getName());
    Assertions.assertEquals(expected.getType(), imported.getType());
    Assertions.assertEquals(expected.getDescription(), imported.getDescription());
    Assertions.assertEquals(expected.getMode(), imported.getMode());

    Assertions.assertNotEquals(expected.getId(), imported.getId());
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new channels attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_channels_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Channel expected : channelComposer.generatedItems) {
      Assertions.assertTrue(
          findSingleExerciseFromDb().getArticles().stream()
              .map(Article::getChannel)
              .anyMatch(channel -> channel.getName().equals(expected.getName())),
          "Channel " + expected.getName() + " not found in imported exercise");
    }
  }

  @DisplayName("Given a valid export zip file, given no preexisting objects, create new tags")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_tags()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Tag expected : tagComposer.generatedItems) {
      Optional<Tag> tagFromDb = tagRepository.findByName(expected.getName());
      if (tagFromDb.isEmpty()) {
        Assertions.fail("Tag " + expected.getName() + " not found");
      }
      Tag imported = tagFromDb.get();

      Assertions.assertEquals(expected.getName(), imported.getName());
      Assertions.assertEquals(expected.getColor(), imported.getColor());

      Assertions.assertNotEquals(expected.getId(), imported.getId());
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new tags attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_tags_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Tag expected : tagComposer.generatedItems) {
      Assertions.assertTrue(
          ExerciseHelper.crawlAllTags(findSingleExerciseFromDb(), challengeService).stream()
              .anyMatch(tag -> tag.getName().equals(expected.getName())),
          "Tag " + expected.getName() + " not found in imported exercise");
    }
  }

  @DisplayName("Given a valid export zip file, given no preexisting objects, create new objectives")
  @Test
  @WithMockAdminUser
  public void given_a_valid_export_zip_file_given_no_preexisting_objects_create_new_objectives()
      throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Objective expected : objectiveComposer.generatedItems) {
      Optional<Objective> objectiveFromDb =
          StreamSupport.stream(objectiveRepository.findAll().spliterator(), false)
              .filter(objective -> objective.getTitle().equals(expected.getTitle()))
              .findFirst();
      if (objectiveFromDb.isEmpty()) {
        Assertions.fail("Objective " + expected.getTitle() + " not found");
      }
      Objective imported = objectiveFromDb.get();

      Assertions.assertEquals(expected.getTitle(), imported.getTitle());
      Assertions.assertEquals(expected.getDescription(), imported.getDescription());

      Assertions.assertNotEquals(expected.getId(), imported.getId());
    }
  }

  @DisplayName(
      "Given a valid export zip file, given no preexisting objects, new objectives attached to imported exercise")
  @Test
  @WithMockAdminUser
  public void
      given_a_valid_export_zip_file_given_no_preexisting_objects_new_objectives_attached_to_imported_exercise()
          throws Exception {
    ExerciseComposer.Composer exerciseWrapper = getExercise();
    byte[] zipBytes = doExport(exerciseWrapper);
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

    for (Objective expected : objectiveComposer.generatedItems) {
      Assertions.assertTrue(
          findSingleExerciseFromDb().getObjectives().stream()
              .anyMatch(objective -> objective.getTitle().equals(expected.getTitle())),
          "Objective " + expected.getTitle() + " not found in imported exercise");
    }
  }
}
