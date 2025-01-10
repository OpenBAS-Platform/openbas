package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.ConfigurationWhen.path;
import static net.javacrumbs.jsonunit.core.ConfigurationWhen.then;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_ARRAY_ORDER;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_EXTRA_ARRAY_ITEMS;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Tag;
import io.openbas.rest.exercise.exports.ExerciseExportMixins;
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

import java.util.Arrays;
import java.util.List;

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

  @BeforeEach
  void before() {
    lessonsQuestionsComposer.reset();
    lessonsCategoryComposer.reset();
    teamComposer.reset();
    userComposer.reset();
    organizationComposer.reset();
    injectComposer.reset();
    challengeComposer.reset();
    objectiveComposer.reset();
    documentComposer.reset();
    tagComposer.reset();
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

    assertThatJson(expectedJson)
            .isObject()
            .isEqualTo(actualJson);
  }

  @DisplayName("Given a valid simulation, the export file is found in zip and correct")
  @Test
  @WithMockAdminUser
  public void test_tags() throws Exception {
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
    List<Tag> expectedTags = tagComposer.generatedItems.stream().filter(tag -> Arrays.asList("exercise tag", "document tag", "challenge tag", "inject tag").contains(tag.getName())).toList();
    String tagsJson = objectMapper.writeValueAsString(expectedTags);

    assertThatJson(actualJson)
            .when(IGNORING_ARRAY_ORDER)
            .node("exercise_tags")
            .isEqualTo(tagsJson);
  }
}
