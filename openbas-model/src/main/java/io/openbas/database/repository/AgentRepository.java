package io.openbas.database.repository;

import io.openbas.database.model.Agent;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentRepository
    extends CrudRepository<Agent, String>, JpaSpecificationExecutor<Agent> {

  Optional<Agent> findByExternalReference(String externalReference);
}
