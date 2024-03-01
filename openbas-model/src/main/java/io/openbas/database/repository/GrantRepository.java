package io.openbas.database.repository;

import io.openbas.database.model.Grant;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GrantRepository extends CrudRepository<Grant, String>, JpaSpecificationExecutor<Grant> {

    @NotNull
    Optional<Grant> findById(@NotNull String id);
}
