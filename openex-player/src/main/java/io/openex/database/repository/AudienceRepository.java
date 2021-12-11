package io.openex.database.repository;

import io.openex.database.model.Audience;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AudienceRepository extends CrudRepository<Audience, String>, JpaSpecificationExecutor<Audience> {

    Optional<Audience> findById(String id);
}
