package io.openex.database.repository;

import io.openex.database.model.SubAudience;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubAudienceRepository extends CrudRepository<SubAudience, String>, JpaSpecificationExecutor<SubAudience> {

    Optional<SubAudience> findById(String id);
}
