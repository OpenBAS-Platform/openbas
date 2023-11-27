package io.openex.database.repository;

import io.openex.database.model.DataMapper;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DataMapperRepository extends CrudRepository<DataMapper, String>, JpaSpecificationExecutor<DataMapper> {

  @NotNull
  Optional<DataMapper> findById(@NotNull final String id);

}
