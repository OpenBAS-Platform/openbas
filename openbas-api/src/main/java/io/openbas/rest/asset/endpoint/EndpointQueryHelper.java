package io.openbas.rest.asset.endpoint;

import static io.openbas.database.model.Asset.ACTIVE_THRESHOLD;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.JpaUtils.createLeftJoin;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class EndpointQueryHelper {

  private EndpointQueryHelper() {}

  // -- SELECT --

  public static void select(
      CriteriaBuilder cb, CriteriaQuery<Tuple> cq, Root<Endpoint> endpointRoot) {
    // Array aggregations
    Join<Endpoint, Executor> endpointExecutorJoin = createLeftJoin(endpointRoot, "executor");
    Expression<String[]> tagIdsExpression = createJoinArrayAggOnId(cb, endpointRoot, "tags");

    // Multiselect
    cq.multiselect(
            endpointRoot.get("id").alias("asset_id"),
            endpointRoot.get("name").alias("asset_name"),
            endpointExecutorJoin.get("id").alias("asset_executor"),
            endpointRoot.get("lastSeen").alias("asset_last_seen"),
            endpointRoot.get("platform").alias("endpoint_platform"),
            endpointRoot.get("arch").alias("endpoint_arch"),
            tagIdsExpression.alias("asset_tags"))
        .distinct(true);

    // Group by
    cq.groupBy(Collections.singletonList(endpointRoot.get("id")));
  }

  // -- EXECUTION --

  public static List<EndpointOutput> execution(TypedQuery<Tuple> query, ObjectMapper mapper) {
    return query.getResultList().stream()
        .map(
            tuple ->
                (EndpointOutput)
                    EndpointOutput.builder()
                        .id(tuple.get("asset_id", String.class))
                        .name(tuple.get("asset_name", String.class))
                        .executor(tuple.get("asset_executor", String.class))
                        .active(isActive(tuple.get("asset_last_seen", Instant.class)))
                        .tags(
                            Arrays.stream(tuple.get("asset_tags", String[].class))
                                .collect(Collectors.toSet()))
                        .platform(tuple.get("endpoint_platform", Endpoint.PLATFORM_TYPE.class))
                        .arch(tuple.get("endpoint_arch", Endpoint.PLATFORM_ARCH.class))
                        .build())
        .toList();
  }

  private static boolean isActive(Instant lastSeen) {
    return Optional.ofNullable(lastSeen)
        .map(last -> (now().toEpochMilli() - last.toEpochMilli()) < ACTIVE_THRESHOLD)
        .orElse(false);
  }
}
