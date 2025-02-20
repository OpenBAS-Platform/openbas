package io.openbas.database.repository;

import io.openbas.database.model.finding.Finding;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FindingRepository extends CrudRepository<Finding, String> {

  Optional<Finding> findByField(@NotNull final String field);
}
