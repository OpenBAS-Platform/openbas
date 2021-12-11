package io.openex.database.repository;

import io.openex.database.model.Dryrun;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryRunRepository extends CrudRepository<Dryrun, String>, JpaSpecificationExecutor<Dryrun> {

    Optional<Dryrun> findById(String id);
}
