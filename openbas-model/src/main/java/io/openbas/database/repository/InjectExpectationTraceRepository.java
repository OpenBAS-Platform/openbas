package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectationTrace;
import io.openbas.database.raw.impl.SimpleRawExpectationTrace;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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

  @Query(nativeQuery = true)
  List<SimpleRawExpectationTrace> findAllTracesNewerThan(
      @Param("alert_date_limit") Instant alertDateLimit);
}
