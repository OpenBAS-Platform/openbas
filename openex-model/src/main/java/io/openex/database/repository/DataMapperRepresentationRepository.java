package io.openex.database.repository;

import io.openex.database.model.DataMapperRepresentation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataMapperRepresentationRepository extends CrudRepository<DataMapperRepresentation, String> {

}
