package io.openex.database.repository;

import io.openex.database.model.Endpoint;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.validation.constraints.NotBlank;
import java.util.Optional;

@Repository
public interface EndpointRepository extends CrudRepository<Endpoint, String>  {

  @Query(value = "select e from Endpoint e where e.externalId = :externalId")
  Optional<Endpoint> findByExternalId(@NotBlank final @Param("externalId") String externalId);

}
