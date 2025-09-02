package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import io.openbas.cron.ScheduleFrequency;
import io.openbas.cron.ScheduleFrequencyConverter;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "security_assessments")
@EntityListeners(ModelBaseListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SecurityAssessment implements Base {

  @Id
  @Column(name = "security_assessment_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @EqualsAndHashCode.Include
  @JsonProperty("security_assessment_id")
  private String id;

  @Column(name = "security_assessment_external_id", nullable = false)
  @JsonProperty("security_assessment_external_id")
  private String externalId;

  @Column(name = "security_assessment_name", nullable = false)
  @JsonProperty("security_assessment_name")
  @NotBlank
  private String name;

  @Column(name = "security_assessment_description")
  @JsonProperty("security_assessment_description")
  private String description;

  @Column(name = "security_assessment_scheduling", nullable = false)
  @JsonProperty("security_assessment_scheduling")
  @Convert(converter = ScheduleFrequencyConverter.class)
  private ScheduleFrequency scheduling;

  @Column(name = "security_assessment_period_start")
  @JsonProperty("security_assessment_period_start")
  private Instant periodStart;

  @Column(name = "security_assessment_period_end")
  @JsonProperty("security_assessment_period_end")
  private Instant periodEnd;

  @Column(name = "security_assessment_threat_context_ref")
  @JsonProperty("security_assessment_threat_context_ref")
  private String threatContextRef;

  @Type(JsonType.class)
  @Column(name = "security_assessment_attack_pattern_refs", columnDefinition = "jsonb")
  @JsonProperty("security_assessment_attack_pattern_refs")
  private List<StixRefToExternalRef> attackPatternRefs;

  @Type(JsonType.class)
  @Column(name = "security_assessment_content", columnDefinition = "jsonb", nullable = false)
  @JsonProperty("security_assessment_content")
  private String content;

  @Type(JsonType.class)
  @Column(name = "security_assessment_vulnerabilities_refs", columnDefinition = "jsonb")
  @JsonProperty("security_assessment_vulnerabilities_refs")
  private List<StixRefToExternalRef> vulnerabilitiesRefs;

  @OneToOne
  @JoinColumn(name = "security_assessment_scenario")
  @JsonIgnore
  private Scenario scenario;

  @CreationTimestamp
  @Column(name = "security_assessment_created_at", updatable = false)
  @JsonProperty("security_assessment_created_at")
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "security_assessment_updated_at")
  @JsonProperty("security_assessment_updated_at")
  private Instant updatedAt;
}
