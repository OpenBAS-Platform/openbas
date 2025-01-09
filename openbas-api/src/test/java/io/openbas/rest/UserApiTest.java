package io.openbas.rest;

import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.UserFixture.EMAIL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.User;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.user.form.login.LoginUserInput;
import io.openbas.rest.user.form.login.ResetUserInput;
import io.openbas.rest.user.form.user.CreateUserInput;
import io.openbas.service.MailingService;
import io.openbas.utils.fixtures.UserFixture;
import java.util.List;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
class UserApiTest extends IntegrationTest {

  private User savedUser;

  @Autowired private MockMvc mvc;

  @Autowired private UserRepository userRepository;

  @MockBean private MailingService mailingService;

  @BeforeAll
  public void setup() {
    // Create user
    User user = new User();
    user.setEmail(EMAIL);
    user.setPassword(UserFixture.ENCODED_PASSWORD);
    if (this.userRepository.findByEmailIgnoreCase(EMAIL).isEmpty()) {
      savedUser = this.userRepository.save(user);
    } else {
      savedUser = this.userRepository.findByEmailIgnoreCase(EMAIL).get();
    }
  }

  @AfterAll
  public void teardown() {
    this.userRepository.deleteById(savedUser.getId());
  }

  @Nested
  @DisplayName("Logging in")
  class LoggingIn {
    @Nested
    @DisplayName("Logging in by email")
    class LoggingInByEmail {
      @DisplayName("Retrieve user by email in lowercase succeed")
      @Test
      @WithMockUser
      void given_known_login_user_input_should_return_user() throws Exception {
        LoginUserInput loginUserInput = UserFixture.getLoginUserInput();

        mvc.perform(
                post("/api/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(loginUserInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("user_email").value(EMAIL));
      }

      @DisplayName("Retrieve user by email failed")
      @Test
      @WithMockUser
      void given_unknown_login_user_input_should_throw_AccessDeniedException() throws Exception {
        LoginUserInput loginUserInput =
            UserFixture.getDefault().login("unknown@filigran.io").password("dontcare").build();

        mvc.perform(
                post("/api/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(loginUserInput)))
            .andExpect(status().is4xxClientError());
      }

      @DisplayName("Retrieve user by email in uppercase succeed")
      @Test
      @WithMockUser
      void given_known_login_user_in_uppercase_input_should_return_user() throws Exception {
        LoginUserInput loginUserInput =
            UserFixture.getDefaultWithPwd().login("USER2@filigran.io").build();

        mvc.perform(
                post("/api/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(loginUserInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("user_email").value(EMAIL));
      }

      @DisplayName("Retrieve user by email in alternatingcase succeed")
      @Test
      @WithMockUser
      void given_known_login_user_in_alternatingcase_input_should_return_user() throws Exception {
        LoginUserInput loginUserInput =
            UserFixture.getDefaultWithPwd().login("uSeR2@filigran.io").build();

        mvc.perform(
                post("/api/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(loginUserInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("user_email").value(EMAIL));
      }
    }
  }

  @Nested
  @DisplayName("Create user")
  class Creating {
    @DisplayName("Create existing user by email in lowercase gives a conflict")
    @Test
    @WithMockUser(roles = {"ADMIN"})
    void given_known_create_user_in_lowercase_input_should_return_conflict() throws Exception {
      CreateUserInput input = new CreateUserInput();
      input.setEmail(EMAIL);

      mvc.perform(
              post("/api/users")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(asJsonString(input)))
          .andExpect(status().isConflict());
    }

    @DisplayName("Create existing user by email in uppercase gives a conflict")
    @Test
    @WithMockUser(roles = {"ADMIN"})
    void given_known_create_user_in_uppercase_input_should_return_conflict() throws Exception {
      CreateUserInput input = new CreateUserInput();
      input.setEmail(EMAIL.toUpperCase());

      mvc.perform(
              post("/api/users")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(asJsonString(input)))
          .andExpect(status().isConflict());
    }
  }

  @Nested
  @DisplayName("Reset Password from I forget my pwd option")
  class ResetPassword {
    @DisplayName("With a known email")
    @Test
    void resetPassword() throws Exception {
      // -- PREPARE --
      ResetUserInput input = UserFixture.getResetUserInput();

      // -- EXECUTE --
      mvc.perform(
              post("/api/reset")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(asJsonString(input)))
          .andExpect(status().isOk());

      // -- ASSERT --
      ArgumentCaptor<List<User>> userCaptor = ArgumentCaptor.forClass(List.class);
      verify(mailingService).sendEmail(anyString(), anyString(), userCaptor.capture());
      assertEquals(EMAIL, userCaptor.getValue().get(0).getEmail());
    }

    @DisplayName("With a unknown email")
    @Test
    void resetPasswordWithUnknownEmail() throws Exception {
      // -- PREPARE --
      ResetUserInput input = UserFixture.getResetUserInput();
      input.setLogin("unknown@filigran.io");

      // -- EXECUTE --
      mvc.perform(
              post("/api/reset")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(asJsonString(input)))
          .andExpect(status().isBadRequest());

      // -- ASSERT --
      verify(mailingService, never()).sendEmail(anyString(), anyString(), any(List.class));
    }
  }
}
