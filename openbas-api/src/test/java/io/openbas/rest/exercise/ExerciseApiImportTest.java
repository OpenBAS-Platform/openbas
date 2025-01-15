package io.openbas.rest.exercise;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.service.ChallengeService;
import io.openbas.service.VariableService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(PER_CLASS)
public class ExerciseApiImportTest extends IntegrationTest {
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
                .forDocument(DocumentFixture.getDocumentJpeg())
                .withTag(tagComposer.forTag(TagFixture.getTagWithText("Document tag"))))
        .withObjective(objectiveComposer.forObjective(ObjectiveFixture.getObjective()))
        .withTag(tagComposer.forTag(TagFixture.getTagWithText("Exercise tag")))
        .withVariable(variableComposer.forVariable(VariableFixture.getVariable()))
        .get();
  }

  @Test
  public void testImport() {
    Exercise exercise = getExercise();
    byte[] zipBytes = null;
  }
}
