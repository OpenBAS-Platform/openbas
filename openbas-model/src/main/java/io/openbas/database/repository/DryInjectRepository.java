package io.openbas.database.repository;

import io.openbas.database.model.DryInject;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DryInjectRepository
    extends CrudRepository<DryInject, String>, JpaSpecificationExecutor<DryInject> {

  @NotNull
  Optional<DryInject> findById(@NotNull String id);
}
