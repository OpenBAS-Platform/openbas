package io.openbas.database.repository;

import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InjectorContractRepository extends
    CrudRepository<InjectorContract, String>,
    JpaSpecificationExecutor<InjectorContract> {

  @NotNull
  Optional<InjectorContract> findById(@NotNull String id);

  @NotNull
  List<InjectorContract> findInjectorContractsByInjector(@NotNull Injector injector);
}
