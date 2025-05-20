package io.openbas.database.model;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.database.converter.ContentConverter;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "execution_traces")
public class ExecutionTrace implements Base {
  @Id
  @Column(name = "execution_trace_id")
  @JsonProperty("execution_trace_id")
  @GeneratedValue
  @UuidGenerator
  @NotNull
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "execution_inject_status_id")
  @Schema(type = "string")
  @JsonSerialize(using = MonoIdDeserializer.class)
  private InjectStatus injectStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "execution_inject_test_status_id")
  @Schema(type = "string")
  @JsonSerialize(using = MonoIdDeserializer.class)
  private InjectTestStatus injectTestStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "execution_agent_id")
  @Schema(type = "string")
  @JsonSerialize(using = MonoIdDeserializer.class)
  private Agent agent;

  @Column(name = "execution_message")
  @JsonProperty("execution_message")
  @NotNull
  private String message;

  @Column(name = "execution_structured_message")
  @Convert(converter = ContentConverter.class)
  @JsonProperty("execution_structured_message")
  private ObjectNode structuredMessage;

  @Column(name = "execution_action")
  @JsonProperty("execution_action")
  @Enumerated(EnumType.STRING)
  private ExecutionTraceAction action;

  @Column(name = "execution_status")
  @JsonProperty("execution_status")
  @Enumerated(EnumType.STRING)
  private ExecutionTraceStatus status;

  @Column(name = "execution_time")
  @JsonProperty("execution_time")
  private Instant time;

  @Type(StringArrayType.class)
  @JsonProperty("execution_context_identifiers")
  @Column(name = "execution_context_identifiers")
  private String[] identifiers;

  @CreationTimestamp
  @Column(name = "execution_created_at")
  @JsonProperty("execution_created_at")
  @NotNull
  private Instant creationDate = now();

  @UpdateTimestamp
  @Column(name = "execution_updated_at")
  @JsonProperty("execution_updated_at")
  @NotNull
  private Instant updateDate = now();

  public List<String> getIdentifiers() {
    return identifiers == null ? List.of() : List.of(identifiers);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  public static ExecutionTrace getNewErrorTrace(String message, ExecutionTraceAction action) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.ERROR, null, message, null, action, null, null);
  }

  public static ExecutionTrace getNewErrorTrace(
      String message, ExecutionTraceAction action, Agent agent) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.ERROR, null, message, null, action, agent, null);
  }

  public static ExecutionTrace getNewErrorTrace(
      String message, ExecutionTraceAction action, List<String> identifiers) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.ERROR, identifiers, message, null, action, null, null);
  }

  public static ExecutionTrace getNewSuccessTrace(String message, ExecutionTraceAction action) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.SUCCESS, null, message, null, action, null, null);
  }

  public static ExecutionTrace getNewSuccessTrace(
      String message, ExecutionTraceAction category, List<String> identifiers) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.SUCCESS, identifiers, message, null, category, null, null);
  }

  public static ExecutionTrace getNewInfoTrace(String message, ExecutionTraceAction action) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.INFO, null, message, null, action, null, null);
  }

  public static ExecutionTrace getNewInfoTrace(
      String message, ExecutionTraceAction action, List<String> identifiers) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.INFO, identifiers, message, null, action, null, null);
  }

  public static ExecutionTrace getNewInfoTrace(
      String message, ExecutionTraceAction action, Agent agent, List<String> identifiers) {
    return new ExecutionTrace(
        null, ExecutionTraceStatus.INFO, identifiers, message, null, action, agent, null);
  }

  public ExecutionTrace() {}

  public ExecutionTrace(
      InjectStatus injectStatus,
      ExecutionTraceStatus status,
      List<String> identifiers,
      String message,
      ObjectNode structuredMessage,
      ExecutionTraceAction action,
      Agent agent,
      Instant time) {
    this.injectStatus = injectStatus;
    this.status = status;
    this.identifiers = identifiers == null ? new String[0] : identifiers.toArray(new String[0]);
    this.message = message;
    this.structuredMessage = structuredMessage;
    this.time = time == null ? Instant.now() : time;
    this.action = action;
    this.agent = agent;
  }
}
