package io.openex.database.repository;

import io.openex.database.model.SubAudience;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubAudienceRepository extends CrudRepository<SubAudience, String>, JpaSpecificationExecutor<SubAudience> {

    @NotNull
    Optional<SubAudience> findById(@NotNull String id);
}
