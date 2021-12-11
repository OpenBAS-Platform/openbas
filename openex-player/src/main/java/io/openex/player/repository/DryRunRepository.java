package io.openex.player.repository;

import io.openex.player.model.database.Audience;
import io.openex.player.model.database.Dryrun;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryRunRepository extends CrudRepository<Dryrun, String>, JpaSpecificationExecutor<Dryrun> {

    Optional<Dryrun> findById(String id);
}
