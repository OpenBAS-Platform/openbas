package io.openbas.database.repository;

import io.openbas.database.model.Log;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LogRepository extends CrudRepository<Log, String>, JpaSpecificationExecutor<Log> {

    @NotNull
    Optional<Log> findById(@NotNull String id);
}
