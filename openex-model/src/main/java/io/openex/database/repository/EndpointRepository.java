package io.openex.database.repository;

import io.openex.database.model.Endpoint;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EndpointRepository extends CrudRepository<Endpoint, String>  { }
