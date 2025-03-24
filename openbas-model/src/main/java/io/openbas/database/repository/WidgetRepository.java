package io.openbas.database.repository;

import io.openbas.database.model.Widget;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WidgetRepository
    extends CrudRepository<Widget, String>, JpaSpecificationExecutor<Widget> {

  List<Widget> findAllByCustomDashboardId(@NotBlank final String id);

  Optional<Widget> findByCustomDashboardIdAndId(
      @NotBlank final String customDashboardId,
      @NotBlank final String id);

  boolean existsWidgetByCustomDashboardIdAndId(
      @NotBlank final String customDashboardId,
      @NotBlank final String id);

}
