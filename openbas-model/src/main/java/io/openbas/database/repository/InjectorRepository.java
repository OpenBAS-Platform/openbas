package io.openbas.database.repository;

import io.openbas.database.model.Injector;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InjectorRepository extends CrudRepository<Injector, String>, JpaSpecificationExecutor<Injector> {

    @NotNull
    Optional<Injector> findById(@NotNull String id);

    @NotNull
    Optional<Injector> findByType(@NotNull String type);

    List<Injector> findAllByPayloads(@NotNull Boolean payloads);
}
