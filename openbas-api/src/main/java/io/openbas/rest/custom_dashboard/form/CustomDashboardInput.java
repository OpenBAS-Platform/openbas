package io.openbas.rest.custom_dashboard.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;
import static java.util.Objects.requireNonNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.CustomDashboard;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomDashboardInput {

  @JsonProperty("custom_dashboard_name")
  @NotBlank(message = MANDATORY_MESSAGE)
  private String name;

  @JsonProperty("custom_dashboard_description")
  private String description;

  @JsonProperty("custom_dashboard_content")
  private String content;

  // -- METHOD --

  public CustomDashboard toCustomDashboard(@NotNull CustomDashboard customDashboard) {
    requireNonNull(customDashboard, "CustomDashboard must not be null.");

    customDashboard.setName(this.getName());
    customDashboard.setDescription(this.getDescription());
    customDashboard.setContent(this.getContent());
    return customDashboard;
  }
}
