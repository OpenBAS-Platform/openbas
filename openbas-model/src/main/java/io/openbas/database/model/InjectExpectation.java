package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Getter
@Entity
@Table(name = "injects_expectations")
@EntityListeners(ModelBaseListener.class)
public class InjectExpectation implements Base {

  public enum EXPECTATION_TYPE {
    TEXT,
    DOCUMENT,
    ARTICLE,
    CHALLENGE,
    MANUAL,
    PREVENTION,
    DETECTION,
  }

  public enum EXPECTATION_STATUS {
    FAILED,
    PENDING,
    PARTIAL,
    UNKNOWN,
    SUCCESS
  }

  @Setter
  @Column(name = "inject_expectation_type")
  @JsonProperty("inject_expectation_type")
  @Enumerated(EnumType.STRING)
  @NotNull
  private EXPECTATION_TYPE type;

  // region basic
  @Id
  @NotBlank
  @Setter
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @Column(name = "inject_expectation_id")
  @JsonProperty("inject_expectation_id")
  private String id;

  @Setter
  @Column(name = "inject_expectation_name")
  @JsonProperty("inject_expectation_name")
  private String name;

  @Setter
  @Column(name = "inject_expectation_description")
  @JsonProperty("inject_expectation_description")
  private String description;

  @Setter
  @Type(JsonType.class)
  @Column(name = "inject_expectation_signatures")
  @JsonProperty("inject_expectation_signatures")
  private List<InjectExpectationSignature> signatures = new ArrayList<>();

  @Setter
  @Type(JsonType.class)
  @Column(name = "inject_expectation_results")
  @JsonProperty("inject_expectation_results")
  private List<InjectExpectationResult> results = new ArrayList<>();

  @Setter
  @Column(name = "inject_expectation_score")
  @JsonProperty("inject_expectation_score")
  private Double score;

  @JsonProperty("inject_expectation_status")
  public EXPECTATION_STATUS getResponse() {

    if (this.getScore() == null) {
      return EXPECTATION_STATUS.PENDING;
    }
    if (team != null) {
      return switch (getResults().getFirst().getResult()) {
        case "Failed" -> EXPECTATION_STATUS.FAILED;
        case "Success" -> EXPECTATION_STATUS.SUCCESS;
        default -> EXPECTATION_STATUS.PENDING;
      };
    }

    if (this.getScore() >= this.getExpectedScore()) {
      return EXPECTATION_STATUS.SUCCESS;
    }
    if (this.getScore() == 0) {
      return EXPECTATION_STATUS.FAILED;
    }
    return EXPECTATION_STATUS.PARTIAL;
  }

  @Setter
  @Column(name = "inject_expectation_expected_score")
  @JsonProperty("inject_expectation_expected_score")
  @NotNull
  private Double expectedScore;

  @Setter
  @Column(name = "inject_expectation_created_at")
  @JsonProperty("inject_expectation_created_at")
  private Instant createdAt = now();

  @Setter
  @Column(name = "inject_expectation_updated_at")
  @JsonProperty("inject_expectation_updated_at")
  private Instant updatedAt = now();

  @Setter
  @Column(name = "inject_expectation_group")
  @JsonProperty("inject_expectation_group")
  private boolean expectationGroup;
  // endregion

  // region contextual relations
  @Setter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "exercise_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_exercise")
  private Exercise exercise;

  @Setter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inject_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_inject")
  private Inject inject;

  @Setter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_user")
  private User user;

  @Setter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_team")
  private Team team;

  @Setter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "asset_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_asset")
  private Asset asset;

  @Setter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "asset_group_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_asset_group")
  private AssetGroup assetGroup;
  // endregion

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "article_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_article")
  private Article article;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "challenge_id")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_expectation_challenge")
  private Challenge challenge;

  public void setArticle(Article article) {
    this.type = EXPECTATION_TYPE.ARTICLE;
    this.article = article;
  }

  public void setChallenge(Challenge challenge) {
    this.type = EXPECTATION_TYPE.CHALLENGE;
    this.challenge = challenge;
  }

  public void setManual(
      @NotNull final Asset asset,
      @NotNull final AssetGroup assetGroup) {
    this.type = EXPECTATION_TYPE.MANUAL;
    this.asset = asset;
    this.assetGroup = assetGroup;
  }

  public void setPrevention(
      @NotNull final Asset asset,
      @NotNull final AssetGroup assetGroup) {
    this.type = EXPECTATION_TYPE.PREVENTION;
    this.asset = asset;
    this.assetGroup = assetGroup;
  }

  public void setDetection(
      @NotNull final Asset asset,
      @NotNull final AssetGroup assetGroup) {
    this.type = EXPECTATION_TYPE.DETECTION;
    this.asset = asset;
    this.assetGroup = assetGroup;
  }

  public boolean isUserHasAccess(User user) {
    return getExercise().isUserHasAccess(user);
  }

  public String getTargetId() {
    if (team != null) {
      return team.getId();
    } else if (asset != null) {
      return asset.getId();
    } else if (assetGroup != null) {
      return assetGroup.getId();
    } else {
      throw new RuntimeException();
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || !Base.class.isAssignableFrom(o.getClass())) {
      return false;
    }
    Base base = (Base) o;
    return id.equals(base.getId());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
