package io.openbas.rest.statistic.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PlatformStatistic {

  @JsonProperty("platform_id")
  private String platformId = "openbas";

  @JsonProperty("scenarios_count")
  private StatisticElement scenariosCount;

  @JsonProperty("exercises_count")
  private StatisticElement exercisesCount;

  @JsonProperty("users_count")
  private StatisticElement usersCount;

  @JsonProperty("teams_count")
  private StatisticElement teamsCount;

  @JsonProperty("assets_count")
  private StatisticElement assetsCount;

  @JsonProperty("asset_groups_count")
  private StatisticElement assetGroupsCount;

  @JsonProperty("injects_count")
  private StatisticElement injectsCount;

  @JsonProperty("expectation_results")
  private List<ExpectationResultsByType> results;

  @JsonProperty("inject_expectation_results")
  private List<InjectExpectationResultsByAttackPattern> injectResults;

  @JsonProperty("exercises_count_by_category")
  private Map<String, Long> exerciseCountByCategory;

  @JsonProperty("exercises_count_by_week")
  private Map<Instant, Long> exercisesCountByWeek;

  @JsonProperty("injects_count_by_attack_pattern")
  private Map<String, Long> injectsCountByAttackPattern;

  public PlatformStatistic() {
    // Default constructor
  }
}
