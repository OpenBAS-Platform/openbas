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
    simulation("simulation", true, false),
    timeRange("timeRange", false, true),
    startDate("startDate", false, true),
    endDate("endDate", false, true),
    scenario("scenario", true, false);

    public final String name;
    public final boolean isInstance;
    public final boolean uniq;

    CustomDashboardParameterType(String name, boolean isInstance, boolean uniq) {
      this.name = name;
      this.isInstance = isInstance;
      this.uniq = uniq;
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
  @Enumerated(EnumType.STRING)
  @JsonProperty("custom_dashboards_parameter_type")
  private CustomDashboardParameterType type;

  // -- RELATION --

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "custom_dashboard_id", nullable = false)
  @JsonIgnore
  private CustomDashboard customDashboard;
}
