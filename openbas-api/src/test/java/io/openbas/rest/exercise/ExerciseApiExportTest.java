package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.model.Tag;
import io.openbas.rest.exercise.exports.ExerciseExportMixins;
import io.openbas.rest.exercise.exports.ExerciseFileExport;
import io.openbas.rest.exercise.exports.VariableMixin;
import io.openbas.service.ChallengeService;
import io.openbas.service.VariableService;
import io.openbas.utils.ZipUtils;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import java.util.Arrays;
import java.util.List;
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
  @Autowired private VariableComposer variableComposer;
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
                .forDocument(DocumentFixture.getDocumentJpeg())
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Document tag"))))
        .withObjective(objectiveComposer.forObjective(ObjectiveFixture.getObjective()))
        .withTag(tagComposer.forTag(TagFixture.getTagWithText("Exercise tag")))
        .withVariable(variableComposer.forVariable(VariableFixture.getVariable()))
        .persist()
        .get();
  }

  @DisplayName("Given a valid simulation, the export file is found in zip and correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_the_export_file_is_found_in_zip_and_correct()
      throws Exception {
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));
    ObjectMapper exportMapper = mapper.copy();
    String expectedJson =
        exportMapper.writeValueAsString(
            ExerciseFileExport.fromExercise(ex, exportMapper, variableService, challengeService)
                .withOptions(0));

    assertThatJson(expectedJson).isObject().isEqualTo(actualJson);
  }

  @DisplayName("Given a valid simulation and default options, exported tags are correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_tags_are_correct()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Tag.class, ExerciseExportMixins.Tag.class);
    List<Tag> expectedTags =
        tagComposer.generatedItems.stream()
            .filter(
                tag ->
                    Arrays.asList("exercise tag", "document tag", "challenge tag", "inject tag")
                        .contains(tag.getName()))
            .toList();
    String tagsJson = objectMapper.writeValueAsString(expectedTags);

    assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("exercise_tags").isEqualTo(tagsJson);
  }

  @DisplayName("Given a valid simulation and default options, exported objectives are correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_objectives_are_correct()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Objective.class, ExerciseExportMixins.Objective.class);
    String objectiveJson = objectMapper.writeValueAsString(objectiveComposer.generatedItems);

    assertThatJson(actualJson)
        .when(IGNORING_ARRAY_ORDER)
        .node("exercise_objectives")
        .isEqualTo(objectiveJson);
  }

  @DisplayName("Given a valid simulation and default options, exported challenges are correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_challenges_are_correct()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Challenge.class, ExerciseExportMixins.Challenge.class);
    String challengeJson = objectMapper.writeValueAsString(challengeComposer.generatedItems);

    assertThatJson(actualJson)
        .when(IGNORING_ARRAY_ORDER)
        .node("exercise_challenges")
        .isEqualTo(challengeJson);
  }

  @DisplayName("Given a valid simulation and default options, exported articles are correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_articles_are_correct()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Article.class, ExerciseExportMixins.Article.class);
    String articleJson = objectMapper.writeValueAsString(articleComposer.generatedItems);

    assertThatJson(actualJson)
        .when(IGNORING_ARRAY_ORDER)
        .node("exercise_articles")
        .isEqualTo(articleJson);
  }

  @DisplayName("Given a valid simulation and default options, exported channels are correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_channels_are_correct()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Channel.class, ExerciseExportMixins.Channel.class);
    String channelJson = objectMapper.writeValueAsString(channelComposer.generatedItems);

    assertThatJson(actualJson)
        .when(IGNORING_ARRAY_ORDER)
        .node("exercise_channels")
        .isEqualTo(channelJson);
  }

  @DisplayName("Given a valid simulation and default options, exported documents are correct")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_documents_are_correct()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Document.class, ExerciseExportMixins.Document.class);
    String documentJson = objectMapper.writeValueAsString(documentComposer.generatedItems);

    assertThatJson(actualJson)
        .when(IGNORING_ARRAY_ORDER)
        .node("exercise_documents")
        .isEqualTo(documentJson);
  }

  @DisplayName("Given a valid simulation and default options, exported variables have no value")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_variables_have_no_value()
      throws Exception {
    ObjectMapper objectMapper = mapper.copy();
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    objectMapper.addMixIn(Variable.class, VariableMixin.class);
    String variableJson = objectMapper.writeValueAsString(variableComposer.generatedItems);

    assertThatJson(actualJson)
        .when(IGNORING_ARRAY_ORDER)
        .node("exercise_variables")
        .isEqualTo(variableJson);
  }

  @DisplayName("Given a valid simulation and default options, exported teams is empty array")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_teams_is_empty_array()
      throws Exception {
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("exercise_teams").isEqualTo("[]");
  }

  @DisplayName("Given a valid simulation and default options, exported users is absent key")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_users_is_absent_key()
      throws Exception {
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("exercise_users").isAbsent();
  }

  @DisplayName("Given a valid simulation and default options, exported organisations is absent key")
  @Test
  @WithMockAdminUser
  public void given_a_valid_simulation_and_default_options_exported_organisations_is_absent_key()
      throws Exception {
    Exercise ex = getExercise();
    byte[] response =
        mvc.perform(
                get(EXERCISE_URI + "/" + ex.getId() + "/export").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsByteArray();

    String actualJson = ZipUtils.getZipEntryAsString(response, "%s.json".formatted(ex.getName()));

    assertThatJson(actualJson).when(IGNORING_ARRAY_ORDER).node("exercise_users").isAbsent();
  }
}
