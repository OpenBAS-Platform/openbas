package io.openex.rest.scenario.export;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;

public class ScenarioExportMixins {

  @JsonIncludeProperties(value = {
      "scenario_id",
      "scenario_name",
      "scenario_description",
      "scenario_subtitle",
      "scenario_message_header",
      "scenario_message_footer",
      "scenario_mail_from",
      "scenarios_tags",
      "scenario_documents",
  })
  public static class Scenario {
  }

  @JsonIgnoreProperties(value = {"scenarios_users", "scenarios_organizations"})
  public static class ScenarioWithoutPlayers {
  }

}
