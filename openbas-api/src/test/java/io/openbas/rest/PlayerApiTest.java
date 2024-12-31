package io.openbas.rest;

import static io.openbas.rest.user.PlayerApi.PLAYER_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Organization;
import io.openbas.database.model.Tag;
import io.openbas.database.model.User;
import io.openbas.database.repository.OrganizationRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.user.form.player.PlayerInput;
import io.openbas.utils.fixtures.OrganizationFixture;
import io.openbas.utils.fixtures.PlayerFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import jakarta.servlet.ServletException;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(PER_CLASS)
public class PlayerApiTest {

  static User PLAYER;
  static PlayerInput PLAYER_INPUT;
  static Tag TAG;
  static Organization ORGANIZATION;

  @Autowired private MockMvc mvc;

  @Value("${openbas.admin.email:#{null}}")
  private String adminEmail;

  @Autowired private OrganizationRepository organizationRepository;

  @Autowired private TagRepository tagRepository;
  @Autowired private UserRepository userRepository;

  @BeforeAll
  void beforeAll() {
    ORGANIZATION = organizationRepository.save(OrganizationFixture.createOrganization());
    TAG = tagRepository.save(TagFixture.getTag());
    PLAYER_INPUT = PlayerFixture.createPlayer();
    PLAYER_INPUT.setOrganizationId(ORGANIZATION.getId());
    PLAYER_INPUT.setTagIds(List.of(TAG.getId()));
  }

  @AfterAll
  void afterAll() {
    organizationRepository.delete(ORGANIZATION);
    tagRepository.delete(TAG);
  }

  @DisplayName("Creation of a player")
  @Test
  @WithMockAdminUser
  void createPlayerTest() throws Exception {
    // --EXECUTE--
    String response =
        mvc.perform(
                post(PLAYER_URI)
                    .content(asJsonString(PLAYER_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Firstname", JsonPath.read(response, "$.user_firstname"));

    // --THEN--
    userRepository.deleteById(JsonPath.read(response, "$.user_id"));
  }

  @DisplayName("Creation of a player with a simple user")
  @Test
  @WithMockPlannerUser
  void createPlayerWithRestrictedUserTest() throws Exception {
    // --EXECUTE--
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    post(PLAYER_URI)
                        .content(asJsonString(PLAYER_INPUT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    String expectedMessage = "User is restricted";
    String actualMessage = exception.getMessage();

    // --ASSERT--
    assertTrue(actualMessage.contains(expectedMessage));
  }

  @DisplayName("Edition of a player")
  @Test
  @WithMockAdminUser
  void updatePlayerTest() throws Exception {
    // --PREPARE--
    User user = new User();
    user.setUpdateAttributes(PLAYER_INPUT);
    PLAYER = userRepository.save(user);
    String newFirstname = "updatedFirstname";
    PLAYER_INPUT.setFirstname(newFirstname);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(PLAYER_URI + "/" + PLAYER.getId())
                    .content(asJsonString(PLAYER_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("updatedFirstname", JsonPath.read(response, "$.user_firstname"));
    // --THEN--
    userRepository.deleteById(JsonPath.read(response, "$.user_id"));
  }

  @DisplayName("Edition of a player with a simple user")
  @Test
  @WithMockPlannerUser
  void updatePlayerWithRestrictedUserTest() throws Exception {

    User user = userRepository.findByEmailIgnoreCase(adminEmail).orElseThrow();
    // --EXECUTE--
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    put(PLAYER_URI + "/" + user.getId())
                        .content(asJsonString(PLAYER_INPUT))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    String expectedMessage = "You dont have the right to update this user";
    String actualMessage = exception.getMessage();

    // --ASSERT--
    assertTrue(actualMessage.contains(expectedMessage));
  }
}
