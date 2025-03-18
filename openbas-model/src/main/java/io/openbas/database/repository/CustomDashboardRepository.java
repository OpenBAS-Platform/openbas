package io.openbas.database.repository;

import io.openbas.database.model.CustomDashboard;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomDashboardRepository
    extends CrudRepository<CustomDashboard, String>, JpaSpecificationExecutor<CustomDashboard> {

  Optional<CustomDashboard> findByName(@NotBlank final String name);

}
