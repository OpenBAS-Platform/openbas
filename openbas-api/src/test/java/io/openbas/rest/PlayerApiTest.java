package io.openbas.rest;

import static io.openbas.rest.user.PlayerApi.PLAYER_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.PlayerFixture.PLAYER_FIXTURE_FIRSTNAME;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class PlayerApiTest extends IntegrationTest {

  static Tag TAG;
  static Organization ORGANIZATION;
  static User USER;

  @Autowired private MockMvc mvc;

  @Value("${openbas.admin.email:#{null}}")
  private String adminEmail;

  @Autowired private OrganizationRepository organizationRepository;
  @Autowired private TagRepository tagRepository;
  @Autowired private UserRepository userRepository;

  @BeforeEach
  void beforeEach() {
    ORGANIZATION = organizationRepository.save(OrganizationFixture.createOrganization());
    TAG = tagRepository.save(TagFixture.getTag());
  }

  @AfterEach
  void afterEach() {
    organizationRepository.delete(ORGANIZATION);
    tagRepository.delete(TAG);
    userRepository.delete(USER);
  }

  @DisplayName("Given valid player input, should create a player successfully")
  @Test
  @WithMockAdminUser
  void given_validPlayerInput_should_createPlayerSuccessfully() throws Exception {
    // -- PREPARE --
    PlayerInput playerInput = buildPlayerInput();

    // -- EXECUTE --
    String response =
        mvc.perform(
                post(PLAYER_URI)
                    .content(asJsonString(playerInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertEquals(PLAYER_FIXTURE_FIRSTNAME, JsonPath.read(response, "$.user_firstname"));
    assertEquals(TAG.getId(), JsonPath.read(response, "$.user_tags[0]"));
    assertEquals(ORGANIZATION.getId(), JsonPath.read(response, "$.user_organization"));

    // -- CLEAN --
    userRepository.deleteById(JsonPath.read(response, "$.user_id"));
  }

  @DisplayName("Given restricted user, should not allow creation of player")
  @Test
  @WithMockPlannerUser
  void given_restrictedUser_should_notAllowPlayerCreation() {
    // -- PREPARE --
    PlayerInput playerInput = buildPlayerInput();

    // --EXECUTE--
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    post(PLAYER_URI)
                        .content(asJsonString(playerInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    // --ASSERT--
    assertTrue(exception.getMessage().contains("User is restricted"));
  }

  @DisplayName("Given valid player input, should update player successfully")
  @Test
  @WithMockAdminUser
  void given_validPlayerInput_should_updatePlayerSuccessfully() throws Exception {
    // --PREPARE--
    PlayerInput playerInput = buildPlayerInput();
    User user = new User();
    user.setUpdateAttributes(playerInput);
    USER = userRepository.save(user);
    String newFirstname = "updatedFirstname";
    playerInput.setFirstname(newFirstname);

    // -- EXECUTE --
    String response =
        mvc.perform(
                post(PLAYER_URI + "/upsert")
                    .content(asJsonString(playerInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertEquals(newFirstname, JsonPath.read(response, "$.user_firstname"));
  }

  @DisplayName("Given non-existing player input, should upsert successfully")
  @Test
  @WithMockAdminUser
  void given_nonExistingPlayerInput_should_upsertSuccessfully() throws Exception {
    // --PREPARE--
    PlayerInput playerInput = buildPlayerInput();

    // --EXECUTE--
    String response =
        mvc.perform(
                post(PLAYER_URI + "/upsert")
                    .content(asJsonString(playerInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(PLAYER_FIXTURE_FIRSTNAME, JsonPath.read(response, "$.user_firstname"));
  }

  @DisplayName("Given valid player ID and input, should update player successfully")
  @Test
  @WithMockAdminUser
  void given_validPlayerIdAndInput_should_updatePlayerSuccessfully() throws Exception {
    // -- PREPARE --
    PlayerInput playerInput = buildPlayerInput();
    User user = new User();
    user.setUpdateAttributes(playerInput);
    USER = userRepository.save(user);
    String newFirstname = "updatedFirstname";
    playerInput.setFirstname(newFirstname);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(PLAYER_URI + "/" + user.getId())
                    .content(asJsonString(playerInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("updatedFirstname", JsonPath.read(response, "$.user_firstname"));
  }

  @DisplayName("Given restricted user, should not allow updating a player")
  @Test
  @WithMockPlannerUser
  void given_restrictedUser_should_notAllowPlayerUpdate() {
    // -- PREPARE --
    PlayerInput playerInput = buildPlayerInput();
    User user = userRepository.findByEmailIgnoreCase(adminEmail).orElseThrow();

    // -- EXECUTE --
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    put(PLAYER_URI + "/" + user.getId())
                        .content(asJsonString(playerInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    // --ASSERT--
    assertTrue(exception.getMessage().contains("You dont have the right to update this user"));
  }

  @DisplayName("Given valid player ID, should delete player successfully")
  @Test
  @WithMockAdminUser
  void given_validPlayerId_should_deletePlayerSuccessfully() throws Exception {
    // -- PREPARE --
    PlayerInput playerInput = buildPlayerInput();
    User user = new User();
    user.setUpdateAttributes(playerInput);
    USER = userRepository.save(user);

    // -- EXECUTE --
    mvc.perform(
            delete(PLAYER_URI + "/" + USER.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertTrue(this.userRepository.findById(USER.getId()).isEmpty());
  }

  // -- PRIVATE --

  private PlayerInput buildPlayerInput() {
    PlayerInput player = PlayerFixture.createPlayerInput();
    player.setOrganizationId(ORGANIZATION.getId());
    player.setTagIds(List.of(TAG.getId()));
    return player;
  }
}
