package io.openex.database.repository;

import io.openex.database.model.DryInject;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DryInjectRepository<T> extends CrudRepository<DryInject<T>, String>, JpaSpecificationExecutor<DryInject<T>> {

    @NotNull
    Optional<DryInject<T>> findById(@NotNull String id);
}
