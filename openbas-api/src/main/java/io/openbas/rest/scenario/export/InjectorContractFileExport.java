package io.openbas.rest.scenario.export;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.hypersistence.utils.hibernate.type.basic.PostgreSQLHStoreType;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.database.converter.ContentConverter;
import io.openbas.database.model.*;
import io.openbas.helper.MultiIdListDeserializer;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.*;

import static java.time.Instant.now;

@Data
@Builder
public class InjectorContractFileExport implements Base {

  @Id
  @JsonProperty("injector_contract_id")
  @NotBlank
  private String id;

  @JsonProperty("injector_contract_labels")
  private Map<String, String> labels = new HashMap<>();

  @JsonProperty("injector_contract_manual")
  private Boolean manual;

  @JsonProperty("injector_contract_content")
  @NotBlank
  private String content;

  @JsonProperty("injector_contract_custom")
  private Boolean custom = false;

  @JsonProperty("injector_contract_needs_executor")
  private Boolean needsExecutor = false;


  @JsonProperty("injector_contract_platforms")
  private Endpoint.PLATFORM_TYPE[] platforms = new Endpoint.PLATFORM_TYPE[0];

  @JsonProperty("injector_contract_arch")
  public Payload.PAYLOAD_EXECUTION_ARCH getArch() {
    return Optional.ofNullable(getPayload())
        .map(payload -> payload.getExecutionArch())
        .orElse(null);
  }

  @JsonProperty("injector_contract_payload")
  private Payload payload;

  @JsonProperty("injector_contract_created_at")
  @NotNull
  private Instant createdAt = now();

  @JsonProperty("injector_contract_updated_at")
  @NotNull
  private Instant updatedAt = now();

  @JsonProperty("injector_contract_injector")
  @NotNull
  private Injector injector;

  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("injector_contract_attack_patterns")
  private List<AttackPattern> attackPatterns = new ArrayList<>();

  @JsonProperty("injector_contract_atomic_testing")
  private boolean isAtomicTesting;

  @JsonProperty("injector_contract_import_available")
  private boolean isImportAvailable;

  @JsonProperty("injector_contract_injector_type")
  private String getInjectorType() {
    return this.getInjector() != null ? this.getInjector().getType() : null;
  }

  @JsonProperty("injector_contract_injector_type_name")
  private String getInjectorName() {
    return this.getInjector() != null ? this.getInjector().getName() : null;
  }

}
