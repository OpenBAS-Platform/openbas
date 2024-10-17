package io.openbas.rest.scenario.export;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIncludeProperties;

public class ScenarioExportMixins {

  @JsonIncludeProperties(
      value = {
        "scenario_id",
        "scenario_name",
        "scenario_description",
        "scenario_subtitle",
        "scenario_category",
        "scenario_main_focus",
        "scenario_severity",
        "scenario_message_header",
        "scenario_message_footer",
        "scenario_mail_from",
        "scenario_tags",
        "scenario_documents",
      })
  public static class Scenario {}

  @JsonIgnoreProperties(value = {"scenario_users", "scenario_organizations"})
  public static class ScenarioWithoutPlayers {}
}
