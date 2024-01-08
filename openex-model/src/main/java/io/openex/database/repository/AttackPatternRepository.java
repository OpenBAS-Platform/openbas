package io.openex.database.repository;

import io.openex.database.model.AttackPattern;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface AttackPatternRepository extends CrudRepository<AttackPattern, String>, JpaSpecificationExecutor<AttackPattern> {

    @NotNull
    Optional<AttackPattern> findById(@NotNull String id);
}
