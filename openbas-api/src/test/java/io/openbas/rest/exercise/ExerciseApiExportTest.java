package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.utils.fixtures.ArticleFixture;
import io.openbas.utils.fixtures.ChannelFixture;
import io.openbas.utils.fixtures.ExerciseFixture;
import io.openbas.utils.fixtures.composers.ArticleComposer;
import io.openbas.utils.fixtures.composers.ChannelComposer;
import io.openbas.utils.fixtures.composers.ExerciseComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;

import java.time.Instant;

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
  @Resource protected ObjectMapper mapper;

  static io.openbas.database.model.Exercise EXERCISE;
  static Instant REFERENCE_TIME;

  @BeforeEach
  void beforeAll() {
    EXERCISE = exerciseComposer
            .withExercise(ExerciseFixture.getExercise())
            .withArticle(
                    articleComposer.withArticle(ArticleFixture.getArticleNoChannel())
                    .withChannel(channelComposer.withChannel(ChannelFixture.getChannel()))
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
