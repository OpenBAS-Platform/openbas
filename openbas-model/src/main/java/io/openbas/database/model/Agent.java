package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Getter
@Setter
@Entity
@Table(name = "agents")
@EntityListeners(ModelBaseListener.class)
public class Agent implements Base {

  public static final int ACTIVE_THRESHOLD = 1800000; // 3 minutes

  public enum PRIVILEGE {
    @JsonProperty("admin")
    admin,
    @JsonProperty("standard")
    standard,
  }

  public enum DEPLOYMENT_MODE {
    @JsonProperty("service")
    service,
    @JsonProperty("session")
    session,
  }

  @Id
  @Column(name = "agent_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("agent_id")
  @NotBlank
  private String id;

  @Queryable(sortable = true)
  @ManyToOne
  @JoinColumn(name = "agent_asset")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("agent_asset")
  @Schema(type = "string")
  @NotNull
  private Asset asset;

  @Queryable(sortable = true)
  @Column(name = "agent_privilege")
  @JsonProperty("agent_privilege")
  @Enumerated(EnumType.STRING)
  @NotNull
  private PRIVILEGE privilege;

  @Queryable(sortable = true)
  @Column(name = "agent_deployment_mode")
  @JsonProperty("agent_deployment_mode")
  @Enumerated(EnumType.STRING)
  @NotNull
  private DEPLOYMENT_MODE deploymentMode;

  @Queryable(sortable = true)
  @Column(name = "agent_executed_by_user")
  @JsonProperty("agent_executed_by_user")
  @NotBlank
  private String executedByUser;

  @Queryable(sortable = true)
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "agent_executor")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("agent_executor")
  @Schema(type = "string")
  private Executor executor;

  @Queryable(filterable = true, sortable = true)
  @Column(name = "agent_version")
  @JsonProperty("agent_version")
  private String version;

  @ManyToOne
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JoinColumn(name = "agent_parent")
  @JsonProperty("agent_parent")
  @Schema(type = "string")
  private Agent parent;

  @OneToOne
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JoinColumn(name = "agent_inject")
  @JsonProperty("agent_inject")
  @Schema(type = "string")
  private Inject inject;

  @JsonProperty("agent_active")
  public boolean getActive() {
    return this.getLastSeen() != null
        && (now().toEpochMilli() - this.getLastSeen().toEpochMilli()) < ACTIVE_THRESHOLD;
  }

  @Column(name = "agent_process_name")
  @JsonProperty("agent_process_name")
  private String processName;

  @Column(name = "agent_external_reference")
  @JsonProperty("agent_external_reference")
  private String externalReference;

  @Column(name = "agent_last_seen")
  @JsonProperty("agent_last_seen")
  private Instant lastSeen;

  @Column(name = "agent_created_at")
  @JsonProperty("agent_created_at")
  @NotNull
  private Instant createdAt = now();

  @Column(name = "agent_updated_at")
  @JsonProperty("agent_updated_at")
  @NotNull
  private Instant updatedAt = now();

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  public Agent() {}
}
