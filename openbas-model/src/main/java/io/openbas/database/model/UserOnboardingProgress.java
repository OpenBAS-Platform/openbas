package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

@Data
@Entity
@Table(name = "user_onboarding_progresses")
@EntityListeners(ModelBaseListener.class)
public class UserOnboardingProgress implements Base {

  @Id
  @Column(name = "onboarding_id")
  @JsonProperty("onboarding_id")
  @GeneratedValue
  @UuidGenerator
  @NotNull
  private UUID id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @JsonIgnore
  private User user;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "user_onboarding_steps",
      joinColumns = @JoinColumn(name = "onboarding_id"))
  @NotNull
  private List<UserOnboardingStepStatus> progress = new ArrayList<>();

  @JsonIgnore
  public Map<String, UserOnboardingStepStatus> getProgressMap() {
    return progress.stream().collect(Collectors.toMap(UserOnboardingStepStatus::getStep, i -> i));
  }

  // -- AUDIT --

  @CreationTimestamp
  @Column(name = "onboarding_created_at")
  @JsonProperty("onboarding_created_at")
  private Instant creationDate;

  @UpdateTimestamp
  @Column(name = "onboarding_updated_at")
  @JsonProperty("onboarding_updated_at")
  private Instant updateDate;

  @Override
  public String getId() {
    return this.id != null ? this.id.toString() : "";
  }

  @Override
  public void setId(String id) {
    this.id = UUID.fromString(id);
  }
}
