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
    SIMULATION("simulation", true, false),
    TIME_RANGE("timeRange", false, true),
    START_DATE("startDate", false, true),
    END_DATE("endDate", false, true),
    SCENARIO("scenario", true, false);

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
