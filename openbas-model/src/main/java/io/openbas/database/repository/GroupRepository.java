package io.openbas.database.repository;

import io.openbas.database.model.Group;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupRepository extends CrudRepository<Group, String>, JpaSpecificationExecutor<Group> {

    @NotNull
    Optional<Group> findById(@NotNull String id);
}
