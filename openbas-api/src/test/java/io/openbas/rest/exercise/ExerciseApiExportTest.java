package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
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
  @Resource protected ObjectMapper mapper;

  static Exercise EXERCISE;

  @BeforeEach
  void beforeAll() {
    EXERCISE = exerciseComposer
            .withExercise(ExerciseFixture.getExercise())
            .withArticle(
                    articleComposer.withArticle(ArticleFixture.getArticleNoChannel())
                    .withChannel(channelComposer.withChannel(ChannelFixture.getChannel()))
            )
            .withLessonCategory(
                    lessonsCategoryComposer.withLessonsCategory(
                            LessonsCategoryFixture.createLessonCategory()
                            )
                            .withLessonsQuestion(
                                    lessonsQuestionsComposer.withLessonsQuestion(
                                            LessonsQuestionFixture.createLessonsQuestion()
                                    )
                            )
            )
            .withTeam(
                    teamComposer.withTeam(
                            TeamFixture.getEmptyTeam()
                    )
                            .withUser(userComposer.withUser(UserFixture.getUser()).withOrganization(organizationComposer.withOrganization(OrganizationFixture.createOrganization())))
            )
            .persist()
            .get();
  }

  @AfterEach
  void afterAll() {
    //this.injectRepository.deleteAll();
    //this.exerciseRepository.deleteAll();
    //this.userRepository.deleteAll();
    //this.teamRepository.deleteAll();
  }

  @Test
  @WithMockAdminUser
  public void test_export() throws Exception {
    String response =
        mvc.perform(
                get(EXERCISE_URI + "/" + EXERCISE.getId() + "/export")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    String toto = response;
  }
}
