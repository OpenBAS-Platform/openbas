package io.openbas.database.raw;

import io.openbas.database.model.Scenario;
import io.openbas.database.model.Tag;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class RawPaginationScenario {

  String scenario_id;
  String scenario_name;
  String scenario_severity;
  String scenario_category;
  String scenario_recurrence;
  List<String> scenario_platforms;
  List<String> scenario_tags;
  Instant scenario_updated_at;

  public RawPaginationScenario(final Scenario scenario) {
    this.scenario_id = scenario.getId();
    this.scenario_name = scenario.getName();
    this.scenario_severity = scenario.getSeverity();
    this.scenario_category = scenario.getCategory();
    this.scenario_recurrence = scenario.getRecurrence();
    this.scenario_platforms = scenario.getPlatforms();
    this.scenario_tags = scenario.getTags().stream().map(Tag::getId).toList();
    this.scenario_updated_at = scenario.getUpdatedAt();
  }
}
