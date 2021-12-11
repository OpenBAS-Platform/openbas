package io.openex.database.repository;

import io.openex.database.model.File;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepository extends CrudRepository<File, String>, JpaSpecificationExecutor<File> {

    Optional<File> findById(String id);

    Optional<File> findByName(String name);
}
