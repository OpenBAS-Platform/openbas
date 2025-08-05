package io.openbas.database.model;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import java.time.Instant;
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
  private String id;

  @Column(
      name = "security_assessment_external_id",
      nullable = false) // security assessment id from octi
  private String externalId;

  @Column(name = "security_assessment_name", nullable = false)
  private String name;

  @Column(name = "security_assessment_description")
  private String description;

  @Column(name = "security_assessment_scheduling", nullable = false)
  private String scheduling;

  @Column(name = "security_assessment_security_coverage_submission_url", nullable = false)
  private String securityCoverageSubmissionUrl;

  @Column(name = "security_assessment_period_start")
  private Instant periodStart;

  @Column(name = "security_assessment_period_end")
  private Instant periodEnd;

  @Column(name = "security_assessment_threat_context_ref")
  private String threatContextRef;

  @Type(StringArrayType.class)
  @Column(name = "security_assessment_attack_pattern_refs", columnDefinition = "text[]")
  private String[] attackPatternRefs;

  @Type(StringArrayType.class)
  @Column(name = "security_assessment_vulnerabilities_refs", columnDefinition = "text[]")
  private String[] vulnerabilitiesRefs;

  @OneToOne
  @JoinColumn(name = "security_assessment_scenario")
  private Scenario scenario;

  @CreationTimestamp
  @Column(name = "security_assessment_created_at", updatable = false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "security_assessment_updated_at")
  private Instant updatedAt;
}
