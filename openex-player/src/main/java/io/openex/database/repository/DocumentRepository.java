package io.openex.database.repository;

import io.openex.database.model.Document;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends CrudRepository<Document, String>, JpaSpecificationExecutor<Document> {

    Optional<Document> findById(String id);

    Optional<Document> findByName(String name);
}
