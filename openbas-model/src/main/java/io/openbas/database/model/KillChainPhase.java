package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Searchable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

import static java.time.Instant.now;

@Data
@Entity
@Table(name = "kill_chain_phases")
@EntityListeners(ModelBaseListener.class)
public class KillChainPhase implements Base {

  @Id
  @Column(name = "phase_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("phase_id")
  private String id;

  @Column(name = "phase_external_id")
  @JsonProperty("phase_external_id")
  private String externalId;

  @Column(name = "phase_stix_id")
  @JsonProperty("phase_stix_id")
  private String stixId;

  @Searchable
  @Column(name = "phase_name")
  @JsonProperty("phase_name")
  private String name;

  @Column(name = "phase_shortname")
  @JsonProperty("phase_shortname")
  private String shortName;

  @Searchable
  @Column(name = "phase_kill_chain_name")
  @JsonProperty("phase_kill_chain_name")
  private String killChainName;

  @Column(name = "phase_description")
  @JsonProperty("phase_description")
  private String description;

  @Column(name = "phase_order")
  @JsonProperty("phase_order")
  private Long order = 0L;

  @Column(name = "phase_created_at")
  @JsonProperty("phase_created_at")
  private Instant createdAt = now();

  @Column(name = "phase_updated_at")
  @JsonProperty("phase_updated_at")
  private Instant updatedAt = now();

}
