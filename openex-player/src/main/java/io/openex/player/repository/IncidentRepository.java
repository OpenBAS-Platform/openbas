package io.openex.player.repository;

import io.openex.player.model.database.Incident;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncidentRepository extends CrudRepository<Incident, String>, JpaSpecificationExecutor<Incident> {

    Optional<Incident> findById(String id);
}
