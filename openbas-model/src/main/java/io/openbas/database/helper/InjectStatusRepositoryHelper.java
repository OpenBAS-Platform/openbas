package io.openbas.database.helper;

import io.openbas.database.model.*;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class InjectStatusRepositoryHelper {

  @Autowired NamedParameterJdbcTemplate jt;

  public void updateInjectStatusWithTraces(
      List<SimpleInjectStatus> injectStatusList, List<SimpleExecutionTrace> executionTraceList) {
    String insertExecutionTraceSQL =
        """
              INSERT INTO execution_traces(
                             execution_action,
                             execution_agent_id,
                             execution_context_identifiers,
                             execution_inject_status_id,
                             execution_inject_test_status_id,
                             execution_message,
                             execution_status,
                             execution_time,
                             execution_trace_id)
                          VALUES (
                             :execution_action,
                             :execution_agent_id,
                             string_to_array(:execution_context_identifiers, ','),
                             :execution_inject_status_id,
                             :execution_inject_test_status_id,
                             :execution_message,
                             :execution_status,
                             :execution_time,
                             :execution_trace_id
                          )
              """;

    MapSqlParameterSource[] params =
        executionTraceList.stream()
            .map(
                r -> {
                  MapSqlParameterSource paramValues = new MapSqlParameterSource();
                  paramValues.addValue("execution_trace_id", UUID.randomUUID().toString());
                  paramValues.addValue("execution_action", r.getAction().name());
                  paramValues.addValue("execution_agent_id", r.getAgentId());
                  paramValues.addValue(
                      "execution_context_identifiers", String.join(",", r.getIdentifiers()));
                  paramValues.addValue("execution_inject_status_id", r.getInjectStatusId());
                  paramValues.addValue(
                      "execution_inject_test_status_id", r.getInjectTestStatusId());
                  paramValues.addValue("execution_message", r.getMessage());
                  paramValues.addValue("execution_status", r.getStatus().name());
                  paramValues.addValue(
                      "execution_time", Timestamp.from(r.getTime()), Types.TIMESTAMP);
                  return paramValues;
                })
            .toArray(MapSqlParameterSource[]::new);

    KeyHolder keyHolder = new GeneratedKeyHolder();
    jt.batchUpdate(insertExecutionTraceSQL, params, keyHolder);

    Map<ExecutionStatus, List<SimpleInjectStatus>> mapInjectStatus =
        injectStatusList.stream().collect(Collectors.groupingBy(SimpleInjectStatus::getName));

    for (Map.Entry<ExecutionStatus, List<SimpleInjectStatus>> executionTrace :
        mapInjectStatus.entrySet()) {
      String updateInjectStatusSQL =
          """
              UPDATE injects_statuses SET
                            tracking_end_date = NOW(),
                            status_name = :status_name
                          WHERE status_id IN (:status_ids)
              """;
      MapSqlParameterSource param = new MapSqlParameterSource();
      param.addValue("status_name", executionTrace.getKey().name());
      param.addValue(
          "status_ids", executionTrace.getValue().stream().map(SimpleInjectStatus::getId).toList());

      jt.update(updateInjectStatusSQL, param);
    }

    String updateInjectUpdateDate =
        """
              UPDATE injects SET
                            inject_updated_at = NOW()
                          WHERE inject_id IN (:inject_ids)
              """;

    MapSqlParameterSource param = new MapSqlParameterSource();
    param.addValue(
        "inject_ids",
        injectStatusList.stream().map(SimpleInjectStatus::getInjectId).distinct().toList());

    jt.update(updateInjectUpdateDate, param);
  }

  public Map<String, SimpleInjectStatus> getSimpleInjectStatusesByInjectId(List<String> injectIds) {
    String query = "SELECT * FROM injects_statuses WHERE status_inject IN (:inject_ids)";

    MapSqlParameterSource paramValues = new MapSqlParameterSource();
    paramValues.addValue("inject_ids", injectIds);

    return jt.queryForStream(
            query, paramValues, new SimpleInjectStatus.SimpleInjectStatusRowMapper())
        .collect(Collectors.toMap(SimpleInjectStatus::getInjectId, Function.identity()));
  }

  public Map<String, List<SimpleExecutionTrace>> getSimpleExecutionTracesByInjectStatusId(
      List<String> injectIds) {
    String query = "SELECT * FROM injects_statuses WHERE status_inject IN (:inject_ids)";

    MapSqlParameterSource paramValues = new MapSqlParameterSource();
    paramValues.addValue("inject_ids", injectIds);

    return jt.queryForStream(
            query, paramValues, new SimpleExecutionTrace.SimpleExecutionTraceRowMapper())
        .collect(Collectors.groupingBy(SimpleExecutionTrace::getInjectStatusId));
  }
}
