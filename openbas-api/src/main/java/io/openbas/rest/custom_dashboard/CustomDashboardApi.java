package io.openbas.rest.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.engine.api.CustomDashboardTimeRange;
import io.openbas.rest.custom_dashboard.form.CustomDashboardInput;
import io.openbas.rest.custom_dashboard.form.CustomDashboardTimeFilterInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(CustomDashboardApi.CUSTOM_DASHBOARDS_URI)
@RequiredArgsConstructor
@PreAuthorize("isAdmin()")
public class CustomDashboardApi extends RestBehavior {

  public static final String CUSTOM_DASHBOARDS_URI = "/api/custom-dashboards";
  private final CustomDashboardService customDashboardService;

  // -- CRUD --

  @PostMapping
  public ResponseEntity<CustomDashboard> createCustomDashboard(
      @RequestBody @Valid @NotNull final CustomDashboardInput input) {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setTimeRange(CustomDashboardTimeRange.LAST_QUARTER);
    customDashboard.setStartDate(Instant.now().minus(Duration.ofDays(90)));
    customDashboard.setEndDate(Instant.now());
    return ResponseEntity.ok(
        this.customDashboardService.createCustomDashboard(
            input.toCustomDashboard(customDashboard)));
  }

  @GetMapping
  public ResponseEntity<List<CustomDashboard>> customDashboards() {
    return ResponseEntity.ok(this.customDashboardService.customDashboards());
  }

  @PostMapping("/search")
  public ResponseEntity<Page<CustomDashboard>> customDashboards(
      @RequestBody @NotNull @Valid final SearchPaginationInput searchPaginationInput) {
    return ResponseEntity.ok(this.customDashboardService.customDashboards(searchPaginationInput));
  }

  @GetMapping("/{customDashboardId}")
  public ResponseEntity<CustomDashboard> customDashboard(
      @PathVariable @NotBlank final String customDashboardId) {
    return ResponseEntity.ok(this.customDashboardService.customDashboard(customDashboardId));
  }

  @PutMapping("/{customDashboardId}")
  public ResponseEntity<CustomDashboard> updateCustomDashboard(
      @PathVariable @NotBlank final String customDashboardId,
      @RequestBody @Valid @NotNull final CustomDashboardInput input) {
    CustomDashboard existingCustomDashboard =
        this.customDashboardService.customDashboard(customDashboardId);
    CustomDashboard updatedCustomDashboard = input.toCustomDashboard(existingCustomDashboard);
    return ResponseEntity.ok(
        this.customDashboardService.updateCustomDashboard(updatedCustomDashboard));
  }

  @DeleteMapping("/{customDashboardId}")
  public ResponseEntity<Void> deleteCustomDashboard(
      @PathVariable @NotBlank final String customDashboardId) {
    this.customDashboardService.deleteCustomDashboard(customDashboardId);
    return ResponseEntity.noContent().build();
  }

  // -- TIME FILTERS--

  @PutMapping("/{customDashboardId}/time")
  public ResponseEntity<CustomDashboard> updateCustomDashboardTimeFilter(
      @PathVariable @NotBlank final String customDashboardId,
      @RequestBody @NotNull CustomDashboardTimeFilterInput timeFilterInput) {
    CustomDashboard existingCustomDashboard =
        this.customDashboardService.customDashboard(customDashboardId);
    existingCustomDashboard.setTimeRange(timeFilterInput.getTimeRange());
    existingCustomDashboard.setStartDate(timeFilterInput.getStartDate());
    existingCustomDashboard.setEndDate(timeFilterInput.getEndDate());
    return ResponseEntity.ok(
        this.customDashboardService.updateCustomDashboard(existingCustomDashboard));
  }

}
