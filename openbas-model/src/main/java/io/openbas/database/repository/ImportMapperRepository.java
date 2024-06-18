package io.openbas.database.repository;

import io.openbas.database.model.ImportMapper;
import io.openbas.database.raw.RawImportMapper;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImportMapperRepository extends CrudRepository<ImportMapper, UUID> {

    @Query(value = "SELECT mapper_id, mapper_name FROM import_mappers", nativeQuery = true)
    List<RawImportMapper> findAllMinimalMappers();
}
