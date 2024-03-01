package io.openbas.database.repository;

import io.openbas.database.model.Organization;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends CrudRepository<Organization, String>, JpaSpecificationExecutor<Organization> {

    @NotNull
    Optional<Organization> findById(@NotNull String id);
}
