package io.openbas.rest.notification_rule;

import static io.openbas.database.model.User.ADMIN_UUID;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.notification_rule.form.CreateNotificationRuleInput;
import io.openbas.rest.notification_rule.form.UpdateNotificationRuleInput;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@TestInstance(PER_CLASS)
public class NotificationRuleApiTest extends IntegrationTest {

  public static final String NOTIFICATION_RULE_URI = "/api/notification-rules";

  @Autowired private MockMvc mvc;

  @Autowired private NotificationRuleRepository notificationRuleRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private ScenarioRepository scenarioRepository;

  @AfterEach
  void afterEach() {
    notificationRuleRepository.deleteAll();
    scenarioRepository.deleteAll();
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void createNotificationRule() throws Exception {

    Scenario scenario = new Scenario();
    scenario.setDescription("Test scenario");
    scenario.setName("Test scenario");
    scenario.setFrom("test@openbas.io");
    scenario = scenarioRepository.save(scenario);

    CreateNotificationRuleInput input =
        CreateNotificationRuleInput.builder()
            .trigger("DIFFERENCE")
            .type("EMAIL")
            .resourceType("SCENARIO")
            .resourceId(scenario.getId())
            .subject("testsubject")
            .build();
    String response =
        mvc.perform(
                post(NOTIFICATION_RULE_URI)
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertEquals(input.getSubject(), JsonPath.read(response, "$.notification_rule_subject"));
    assertEquals(input.getTrigger(), JsonPath.read(response, "$.notification_rule_trigger"));
    assertEquals(input.getResourceId(), JsonPath.read(response, "$.notification_rule_resource_id"));
    assertEquals(
        input.getResourceType(), JsonPath.read(response, "$.notification_rule_resource_type"));
    assertEquals(ADMIN_UUID, JsonPath.read(response, "$.notification_rule_owner"));
  }

  @Test
  @WithMockAdminUser
  void createNotificationRule_unexisting_scenario_id() throws Exception {

    CreateNotificationRuleInput input =
        CreateNotificationRuleInput.builder()
            .trigger("DIFFERENCE")
            .type("EMAIL")
            .resourceType("SCENARIO")
            .resourceId("testid")
            .subject("testsubject")
            .build();
    String response =
        mvc.perform(
                post(NOTIFICATION_RULE_URI)
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is4xxClientError())
            .andReturn()
            .getResponse()
            .getContentAsString();
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void updateNotificationRule() throws Exception {
    NotificationRule notificationRule = createNotificationRuleInDb("resourceid");

    String updatedSubject = "updated Subject";
    UpdateNotificationRuleInput updatedInput =
        UpdateNotificationRuleInput.builder().subject(updatedSubject).build();
    String response =
        mvc.perform(
                put(NOTIFICATION_RULE_URI + "/" + notificationRule.getId())
                    .content(asJsonString(updatedInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(updatedSubject, JsonPath.read(response, "$.subject"));
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void updateNotificationRule_WITH_unexisting_id() throws Exception {

    String updatedSubject = "updated Subject";
    UpdateNotificationRuleInput updatedInput =
        UpdateNotificationRuleInput.builder().subject(updatedSubject).build();
    mvc.perform(
            put(NOTIFICATION_RULE_URI + "/randomid")
                .content(asJsonString(updatedInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void deleteNotificationRule() throws Exception {
    String uuid = createNotificationRuleInDb("resourceid").getId();

    mvc.perform(
            delete(NOTIFICATION_RULE_URI + "/" + uuid)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assertTrue(notificationRuleRepository.findById(uuid).isEmpty());
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void deleteNotificationRule_WITH_unexisting_id() throws Exception {
    mvc.perform(
            delete(NOTIFICATION_RULE_URI + "/radomid")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void findNotificationRule() throws Exception {
    NotificationRule notificationRule = createNotificationRuleInDb("resourceid");

    String response =
        mvc.perform(
                get(NOTIFICATION_RULE_URI + "/" + notificationRule.getId())
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(
        notificationRule.getSubject(), JsonPath.read(response, "$.notification_rule_subject"));
    assertEquals(
        notificationRule.getTrigger().name(),
        JsonPath.read(response, "$.notification_rule_trigger"));
    assertEquals(
        notificationRule.getResourceId(),
        JsonPath.read(response, "$.notification_rule_resource_id"));
    assertEquals(
        notificationRule.getResourceType().name(),
        JsonPath.read(response, "$.notification_rule_resource_type"));
    assertEquals(
        notificationRule.getOwner().getId(), JsonPath.read(response, "$.notification_rule_owner"));
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void findNotificationRuleByResource() throws Exception {

    NotificationRule notificationRule = createNotificationRuleInDb("resourceid");

    String response =
        mvc.perform(
                get(NOTIFICATION_RULE_URI + "/resource/" + notificationRule.getResourceId())
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(
        notificationRule.getSubject(), JsonPath.read(response, "$[0].notification_rule_subject"));
    assertEquals(
        notificationRule.getTrigger().name(),
        JsonPath.read(response, "$[0].notification_rule_trigger"));
    assertEquals(
        notificationRule.getResourceId(),
        JsonPath.read(response, "$[0].notification_rule_resource_id"));
    assertEquals(
        notificationRule.getResourceType().name(),
        JsonPath.read(response, "$[0].notification_rule_resource_type"));
    assertEquals(
        notificationRule.getOwner().getId(),
        JsonPath.read(response, "$[0].notification_rule_owner"));
  }

  @Test
  @WithMockAdminUser
  @Transactional
  void searchTagRule() throws Exception {
    createNotificationRuleInDb("notificationRule1");
    createNotificationRuleInDb("notificationRule2");
    createNotificationRuleInDb("notificationRule3");
    createNotificationRuleInDb("notificationRule4");

    SearchPaginationInput input = new SearchPaginationInput();
    input.setSize(2);
    input.setPage(0);

    String response =
        mvc.perform(
                post(NOTIFICATION_RULE_URI + "/search")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(Integer.valueOf(2), JsonPath.read(response, "$.numberOfElements"));
    assertEquals(Integer.valueOf(4), JsonPath.read(response, "$.totalElements"));
  }

  private NotificationRule createNotificationRuleInDb(String resourceId) {
    return notificationRuleRepository.save(getNotificationRule(resourceId));
  }

  private NotificationRule getNotificationRule(String resourceId) {
    NotificationRule notificationRule = new NotificationRule();
    notificationRule.setOwner(userRepository.findById(ADMIN_UUID).orElse(null));
    notificationRule.setSubject("subject");
    notificationRule.setResourceType(NotificationRuleResourceType.SCENARIO);
    notificationRule.setTrigger(NotificationRuleTrigger.DIFFERENCE);
    notificationRule.setType(NotificationRuleType.EMAIL);
    notificationRule.setResourceId(resourceId);
    return notificationRule;
  }
}
