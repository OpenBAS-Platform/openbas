package io.openbas.database.repository;

import io.openbas.database.model.Finding;

import java.util.Date;
import java.util.List;

import io.openbas.database.raw.RawFinding;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FindingRepository
    extends CrudRepository<Finding, String>, JpaSpecificationExecutor<Finding> {

  List<Finding> findAllByInjectId(@NotNull final String injectId);

  @Query(
          value =
                  "SELECT f.finding_id, f.finding_value, f.finding_type, f.finding_field," +
                          " f.finding_inject_id, i.inject_scenario, f.finding_created_at, f.finding_updated_at "
                          + "FROM findings f "
                          + "LEFT JOIN injects i ON i.inject_id = f.finding_inject_id "
                          + "WHERE f.finding_updated_at > :from ORDER BY f.finding_updated_at LIMIT 500;",
          nativeQuery = true)
  List<RawFinding> findForIndexing(@Param("from") Date from);
}
