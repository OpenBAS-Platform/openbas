package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Getter
@Setter
@Entity
@Table(name = "custom_dashboards_parameters")
@EntityListeners(ModelBaseListener.class)
public class CustomDashboardParameters implements Base {

  public enum CustomDashboardParameterType {
    simulation("simulation", true);

    public final String name;
    public final boolean isInstance;

    CustomDashboardParameterType(String name, boolean isInstance) {
      this.name = name;
      this.isInstance = isInstance;
    }
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

  // -- RELATION --

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "custom_dashboard_id", nullable = false)
  @JsonIgnore
  private CustomDashboard customDashboard;
}
