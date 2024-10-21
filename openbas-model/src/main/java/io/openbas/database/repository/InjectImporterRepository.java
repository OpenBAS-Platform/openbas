package io.openbas.database.repository;

import io.openbas.database.model.InjectImporter;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectImporterRepository extends CrudRepository<InjectImporter, UUID> {}
