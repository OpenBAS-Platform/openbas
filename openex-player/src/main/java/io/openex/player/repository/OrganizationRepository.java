package io.openex.player.repository;

import io.openex.player.model.database.Organization;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends CrudRepository<Organization, String>, JpaSpecificationExecutor<Organization> {

    Optional<Organization> findById(String id);
}
