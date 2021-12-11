package io.openex.player.repository;

import io.openex.player.model.database.ComcheckStatus;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComcheckStatusRepository extends CrudRepository<ComcheckStatus, String>, JpaSpecificationExecutor<ComcheckStatus> {

    Optional<ComcheckStatus> findById(String id);
}
