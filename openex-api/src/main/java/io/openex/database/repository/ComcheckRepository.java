package io.openex.database.repository;

import io.openex.database.model.Comcheck;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComcheckRepository extends CrudRepository<Comcheck, String>, JpaSpecificationExecutor<Comcheck> {

    @NotNull
    Optional<Comcheck> findById(@NotNull String id);
}
