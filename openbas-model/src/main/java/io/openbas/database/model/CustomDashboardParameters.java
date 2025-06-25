package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "custom_dashboards_parameters")
@EntityListeners(ModelBaseListener.class)
public class CustomDashboardParameters implements Base {

  public enum CustomDashboardParameterType {
    simulation
  }

  @Id
  @Column(name = "custom_dashboards_parameter_id", updatable = false, nullable = false)
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("custom_dashboards_parameter_id")
  @NotBlank
  private String id;

  @Column(name = "custom_dashboards_parameter_name", nullable = false)
  @NotNull
  @JsonProperty("custom_dashboards_parameter_name")
  private String name;

  @Column(name = "custom_dashboards_parameter_type", nullable = false)
  @NotNull
  @JsonProperty("custom_dashboards_parameter_type")
  private CustomDashboardParameterType type;

  @Column(name = "custom_dashboards_parameter_value")
  @JsonProperty("custom_dashboards_parameter_value")
  private String value;

  // -- RELATION --

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "custom_dashboard_id", nullable = false)
  @JsonIgnore
  private CustomDashboard customDashboard;
}
