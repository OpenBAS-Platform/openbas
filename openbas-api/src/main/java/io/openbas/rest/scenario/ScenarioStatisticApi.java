package io.openbas.rest.scenario;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static org.springframework.util.StringUtils.hasText;

import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.scenario.response.ScenarioStatistic;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ScenarioStatisticApi extends RestBehavior {

  private final ScenarioRepository scenarioRepository;

  @GetMapping(SCENARIO_URI + "/statistics")
  @Transactional(rollbackOn = Exception.class)
  @Operation(summary = "Retrieve scenario statistics")
  public ScenarioStatistic scenarioStatistic() {
    ScenarioStatistic statistic = new ScenarioStatistic();
    statistic.setScenariosGlobalCount(this.scenarioRepository.count());
    statistic.setScenariosCategoriesCount(findTopCategories());
    return statistic;
  }

  private Map<String, Long> findTopCategories() {
    List<Object[]> results = this.scenarioRepository.findTopCategories(3);
    Map<String, Long> categoryCount = new LinkedHashMap<>();
    for (Object[] result : results) {
      String category = (String) result[0];
      if (hasText(category)) {
        Long count = (Long) result[1];
        categoryCount.put(category, count);
      }
    }
    return categoryCount;
  }
}
