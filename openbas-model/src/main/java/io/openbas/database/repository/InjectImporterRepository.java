package io.openbas.database.repository;

import io.openbas.database.model.InjectImporter;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InjectImporterRepository extends CrudRepository<InjectImporter, UUID> {
}
