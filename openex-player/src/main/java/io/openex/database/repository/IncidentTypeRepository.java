package io.openex.database.repository;

import io.openex.database.model.IncidentType;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncidentTypeRepository extends CrudRepository<IncidentType, String>, JpaSpecificationExecutor<IncidentType> {

    Optional<IncidentType> findById(String id);
}
