package io.openbas.rest.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.Widget;
import io.openbas.database.repository.WidgetRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static io.openbas.helper.StreamHelper.fromIterable;

@Service
@RequiredArgsConstructor
public class WidgetService {

  private final CustomDashboardService customDashboardService;
  private final WidgetRepository widgetRepository;

  // -- CRUD --

  @Transactional
  public Widget createWidget(
      @NotBlank final String customDashboardId,
      @NotNull final Widget widget) {
    CustomDashboard customDashboard = customDashboardService.customDashboard(customDashboardId);
    widget.setCustomDashboard(customDashboard);
    return this.widgetRepository.save(widget);
  }

  @Transactional(readOnly = true)
  public List<Widget> widgets(@NotBlank final String customDashboardId) {
    return fromIterable(this.widgetRepository.findAllByCustomDashboardId(customDashboardId));
  }

  @Transactional(readOnly = true)
  public Widget widget(
      @NotBlank final String customDashboardId,
      @NotBlank final String widgetId) {
    return this.widgetRepository
        .findByCustomDashboardIdAndId(customDashboardId, widgetId)
        .orElseThrow(
            () -> new EntityNotFoundException("Widget with id: " + widgetId));
  }

  @Transactional
  public Widget updateWidget(@NotNull final Widget widget) {
    return this.widgetRepository.save(widget);
  }

  @Transactional
  public void deleteWidget(
      @NotBlank final String customDashboardId,
      @NotBlank final String widgetId) {
    if (!this.widgetRepository.existsWidgetByCustomDashboardIdAndId(customDashboardId, widgetId)) {
      throw new EntityNotFoundException("Widget not found with id: " + widgetId);
    }
    this.widgetRepository.deleteById(widgetId);
  }
}
