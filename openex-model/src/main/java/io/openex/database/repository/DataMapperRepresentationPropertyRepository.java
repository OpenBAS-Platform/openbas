package io.openex.database.repository;

import io.openex.database.model.DataMapperRepresentationProperty;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataMapperRepresentationPropertyRepository extends
    CrudRepository<DataMapperRepresentationProperty, String> {

}
