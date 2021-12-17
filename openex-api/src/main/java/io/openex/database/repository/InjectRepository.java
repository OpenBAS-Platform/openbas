package io.openex.database.repository;

import io.openex.database.model.Inject;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InjectRepository<T> extends CrudRepository<Inject<T>, String>, JpaSpecificationExecutor<Inject<T>> {

    @NotNull
    Optional<Inject<T>> findById(@NotNull String id);
}
