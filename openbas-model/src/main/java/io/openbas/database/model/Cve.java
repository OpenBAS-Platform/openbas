package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiIdListDeserializer;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import static java.time.Instant.now;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cves")
@EntityListeners(ModelBaseListener.class)
public class Cve implements Base {

  @Id
  @Column(name = "cve_id")
  @JsonProperty("cve_id")
  @EqualsAndHashCode.Include
  @NotBlank
  @Queryable(searchable = true, filterable = true, sortable = true)
  private String id;

  @Column(name = "cve_source_identifier")
  @JsonProperty("cve_source_identifier")
  private String sourceIdentifier;

  @Column(name = "cve_published")
  @JsonProperty("cve_published")
  private Instant published;

  @Column(name = "cve_description")
  @JsonProperty("cve_description")
  private String description;

  @Column(name = "cve_remediation")
  @JsonProperty("cve_remediation")
  private String remediation;

  @Column(name = "cve_cisa_exploit_add")
  @JsonProperty("cve_cisa_exploit_add")
  private Instant cisaExploitAdd;

  @Column(name = "cve_cisa_action_due")
  @JsonProperty("cve_cisa_action_due")
  private Instant cisaActionDue;

  @Column(name = "cve_cisa_required_action")
  @JsonProperty("cve_cisa_required_action")
  private String cisaRequiredAction;

  @Column(name = "cve_cisa_vulnerability_name")
  @JsonProperty("cve_cisa_vulnerability_name")
  private String cisaVulnerabilityName;

  @ElementCollection
  @CollectionTable(name = "cve_reference_urls", joinColumns = @JoinColumn(name = "cve_id"))
  @Column(name = "cve_reference_url")
  @JsonProperty("cve_reference_urls")
  private List<String> referenceUrls = new ArrayList<>();

  @NotNull
  @Column(name = "cve_cvss", precision = 3, scale = 1)
  @JsonProperty("cve_cvss")
  private BigDecimal cvss;

  @ArraySchema(schema = @Schema(type = "string"))
  @ManyToMany
  @JoinTable(
      name = "cves_cwes",
      joinColumns = @JoinColumn(name = "cve_id"),
      inverseJoinColumns = @JoinColumn(name = "cwe_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("cves_cwes")
  private Set<Cwe> cwes = new HashSet<>();

  // -- AUDIT --

  @Queryable(filterable = true, sortable = true, label = "created at")
  @CreationTimestamp
  @Column(name = "cve_created_at", updatable = false, nullable = false)
  @JsonProperty("cve_created_at")
  @NotNull
  private Instant creationDate = now();

  @Queryable(filterable = true, sortable = true, label = "updated at")
  @UpdateTimestamp
  @Column(name = "cve_updated_at", nullable = false)
  @JsonProperty("cve_updated_at")
  @NotNull
  private Instant updateDate = now();
}
