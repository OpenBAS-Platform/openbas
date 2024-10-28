package io.openbas.database.repository;

import io.openbas.database.model.Group;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository
    extends CrudRepository<Group, String>, JpaSpecificationExecutor<Group> {

  @NotNull
  Optional<Group> findById(@NotNull String id);
}
