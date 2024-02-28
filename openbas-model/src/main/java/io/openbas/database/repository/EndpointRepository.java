package io.openbas.database.repository;

import io.openbas.database.model.Endpoint;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EndpointRepository extends CrudRepository<Endpoint, String> {

  @Query(value = "select e.* from assets e where e.asset_sources[:sourceKey] = :sourceValue", nativeQuery = true)
  Optional<Endpoint> findBySource(
      @NotBlank final @Param("sourceKey") String sourceKey,
      @NotBlank final @Param("sourceValue") String sourceValue
  );

}
