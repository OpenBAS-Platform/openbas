package io.openex.player.repository;

import io.openex.player.model.database.SubAudience;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubAudienceRepository extends CrudRepository<SubAudience, String>, JpaSpecificationExecutor<SubAudience> {

    Optional<SubAudience> findById(String id);
}
