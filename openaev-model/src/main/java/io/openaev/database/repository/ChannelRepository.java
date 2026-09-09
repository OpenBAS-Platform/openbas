package io.openaev.database.repository;

import io.openaev.database.model.Channel;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelRepository
    extends CrudRepository<Channel, String>, JpaSpecificationExecutor<Channel> {
  
  List<Channel> findByNameIgnoreCase(String name);

  List<Channel> findByNameIgnoreCaseAndTenantId(String name, String tenantId);

  List<Channel> findDistinctByArticlesExerciseId(String simulationId);

  List<Channel> findDistinctByArticlesScenarioId(String scenarioId);
}
