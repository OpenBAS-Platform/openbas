package io.openex.player.repository;

import io.openex.player.model.database.Audience;
import io.openex.player.model.database.Objective;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AudienceRepository extends CrudRepository<Audience, String>, JpaSpecificationExecutor<Audience> {

    Optional<Audience> findById(String id);
}
