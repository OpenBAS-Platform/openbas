package io.openbas.database.repository;

import io.openbas.database.model.Finding;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FindingRepository
    extends CrudRepository<Finding, String>, JpaSpecificationExecutor<Finding> {

  List<Finding> findAllByInjectId(@NotNull final String injectId);

  Optional<Finding> findByInjectIdAndValue(@NotBlank final String id, @NotBlank final String value);
}
