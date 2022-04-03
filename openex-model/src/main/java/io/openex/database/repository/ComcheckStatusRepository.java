package io.openex.database.repository;

import io.openex.database.model.ComcheckStatus;
import javax.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComcheckStatusRepository extends CrudRepository<ComcheckStatus, String>, JpaSpecificationExecutor<ComcheckStatus> {

    @NotNull
    Optional<ComcheckStatus> findById(@NotNull String id);
}
