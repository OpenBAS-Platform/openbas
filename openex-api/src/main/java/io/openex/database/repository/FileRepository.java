package io.openex.database.repository;

import io.openex.database.model.File;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepository extends CrudRepository<File, String>, JpaSpecificationExecutor<File> {

    @NotNull
    Optional<File> findById(@NotNull String id);

    Optional<File> findByName(String name);
}
