package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectationTrace;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectExpectationTraceRepository
    extends CrudRepository<InjectExpectationTrace, String>,
        JpaSpecificationExecutor<InjectExpectationTrace> {

  @NotNull
  Optional<InjectExpectationTrace> findByAlertLink(String alertLink);

  @Query(
      "select t from InjectExpectationTrace t where t.injectExpectation.id = :expectationId and t.securityPlatform.id = :sourceId")
  List<InjectExpectationTrace> findByExpectationAndSecurityPlatform(
      @Param("expectationId") final String expectationId, @Param("sourceId") final String sourceId);

  @Query(
      "select count(distinct t) from InjectExpectationTrace t where t.injectExpectation.id = :expectationId and t.securityPlatform.id = :sourceId")
  long countAlerts(
      @Param("expectationId") final String expectationId, @Param("sourceId") final String sourceId);

  @Modifying
  @Query(
      value =
          "INSERT INTO injects_expectations_traces (inject_expectation_trace_id, inject_expectation_trace_expectation, inject_expectation_trace_source_id, inject_expectation_trace_alert_link, inject_expectation_trace_alert_name, inject_expectation_trace_date, inject_expectation_trace_created_at, inject_expectation_trace_updated_at) "
              + "VALUES (:id, :expectationId, :securityPlatformId, :alertLink, :alertName, :alertDate, :createdAtDate, :updatedAtDate) "
              + "ON CONFLICT (inject_expectation_trace_expectation, inject_expectation_trace_source_id, inject_expectation_trace_alert_name, inject_expectation_trace_alert_link) DO NOTHING",
      nativeQuery = true)
  void insertIfNotExists(
      @Param("id") String id,
      @Param("expectationId") String expectationId,
      @Param("securityPlatformId") String securityPlatformId,
      @Param("alertLink") String alertLink,
      @Param("alertName") String alertName,
      @Param("alertDate") Instant alertDate,
      @Param("createdAtDate") Instant createdAtDate,
      @Param("updatedAtDate") Instant updatedAtDate);
}
