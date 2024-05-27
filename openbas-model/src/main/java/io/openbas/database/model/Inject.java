package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.database.converter.ContentConverter;
import io.openbas.database.raw.*;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import io.openbas.helper.MultiModelDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.java.Log;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

import static java.time.Duration.between;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

@Setter
@Entity
@Table(name = "injects")
@EntityListeners(ModelBaseListener.class)
@Log
public class Inject implements Base, Injection {

  public static final int SPEED_STANDARD = 1; // Standard speed define by the user.

  public static final Comparator<Inject> executionComparator = (o1, o2) -> {
    if (o1.getDate().isPresent() && o2.getDate().isPresent()) {
      return o1.getDate().get().compareTo(o2.getDate().get());
    }
    return o1.getId().compareTo(o2.getId());
  };

  @Getter
  @Id
  @Column(name = "inject_id")
  @GeneratedValue(generator = "UUID")
  @UuidGenerator
  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @Getter
  @Queryable(searchable = true, filterable = true, sortable = true)
  @Column(name = "inject_title")
  @JsonProperty("inject_title")
  private String title;

  @Getter
  @Column(name = "inject_description")
  @JsonProperty("inject_description")
  private String description;

  @Getter
  @Column(name = "inject_country")
  @JsonProperty("inject_country")
  private String country;

  @Getter
  @Column(name = "inject_city")
  @JsonProperty("inject_city")
  private String city;

  @Getter
  @Column(name = "inject_enabled")
  @JsonProperty("inject_enabled")
  private boolean enabled = true;

  @Getter
  @Column(name = "inject_content")
  @Convert(converter = ContentConverter.class)
  @JsonProperty("inject_content")
  private ObjectNode content;

  @Getter
  @Column(name = "inject_created_at")
  @JsonProperty("inject_created_at")
  private Instant createdAt = now();

  @Getter
  @Column(name = "inject_updated_at")
  @Queryable(sortable = true)
  @JsonProperty("inject_updated_at")
  private Instant updatedAt = now();

  @Getter
  @Column(name = "inject_all_teams")
  @JsonProperty("inject_all_teams")
  private boolean allTeams;

  @Getter
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "inject_exercise")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_exercise")
  private Exercise exercise;

  @Getter
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "inject_scenario")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_scenario")
  private Scenario scenario;

  @Getter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inject_depends_from_another")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_depends_on")
  private Inject dependsOn;

  @Getter
  @Column(name = "inject_depends_duration")
  @JsonProperty("inject_depends_duration")
  @NotNull
  @Min(value = 0L, message = "The value must be positive")
  private Long dependsDuration;

  @Getter
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "inject_injector_contract")
  @JsonProperty("inject_injector_contract")
  private InjectorContract injectorContract;

  @Getter
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inject_user")
  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_user")
  private User user;

  // CascadeType.ALL is required here because inject status are embedded
  @OneToOne(mappedBy = "inject", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("inject_status")
  private InjectStatus status;

  @Getter
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "injects_tags",
      joinColumns = @JoinColumn(name = "inject_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("inject_tags")
  private List<Tag> tags = new ArrayList<>();

  @Getter
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "injects_teams",
      joinColumns = @JoinColumn(name = "inject_id"),
      inverseJoinColumns = @JoinColumn(name = "team_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("inject_teams")
  private List<Team> teams = new ArrayList<>();

  @Getter
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "injects_assets",
      joinColumns = @JoinColumn(name = "inject_id"),
      inverseJoinColumns = @JoinColumn(name = "asset_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("inject_assets")
  private List<Asset> assets = new ArrayList<>();

  @Getter
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "injects_asset_groups",
      joinColumns = @JoinColumn(name = "inject_id"),
      inverseJoinColumns = @JoinColumn(name = "asset_group_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("inject_asset_groups")
  private List<AssetGroup> assetGroups = new ArrayList<>();

  @Getter
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "injects_payloads",
      joinColumns = @JoinColumn(name = "inject_id"),
      inverseJoinColumns = @JoinColumn(name = "payload_id"))
  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("inject_payloads")
  private List<Asset> payloads = new ArrayList<>();

  // CascadeType.ALL is required here because of complex relationships
  @Getter
  @OneToMany(mappedBy = "inject", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("inject_documents")
  @JsonSerialize(using = MultiModelDeserializer.class)
  private List<InjectDocument> documents = new ArrayList<>();

  // CascadeType.ALL is required here because communications are embedded
  @Getter
  @OneToMany(mappedBy = "inject", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("inject_communications")
  @JsonSerialize(using = MultiModelDeserializer.class)
  private List<Communication> communications = new ArrayList<>();

  // CascadeType.ALL is required here because expectations are embedded
  @Getter
  @OneToMany(mappedBy = "inject", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("inject_expectations")
  @JsonSerialize(using = MultiModelDeserializer.class)
  private List<InjectExpectation> expectations = new ArrayList<>();

  // region transient
  @Transient
  public String getHeader() {
    return ofNullable(this.getExercise()).map(Exercise::getHeader).orElse("");
  }

  @Transient
  public String getFooter() {
    return ofNullable(this.getExercise()).map(Exercise::getFooter).orElse("");
  }

  @JsonIgnore
  @Override
  public boolean isUserHasAccess(User user) {
    return this.getExercise().isUserHasAccess(user);
  }

  @JsonIgnore
  public void clean() {
    this.status = null;
    this.communications.clear();
    this.expectations.clear();
  }

  @JsonProperty("inject_users_number")
  public long getNumberOfTargetUsers() {
    Exercise exercise = getExercise();
    if (exercise == null) {
      return 0L;
    }
    if (this.allTeams) {
      return getExercise().usersNumber();
    }
    return getTeams().stream()
        .map(team -> team.getUsersNumberInExercise(getExercise().getId()))
        .reduce(Long::sum).orElse(0L);
  }

  @JsonIgnore
  public Instant computeInjectDate(Instant source, int speed) {
    // Compute origin execution date
    Optional<Inject> dependsOnInject = ofNullable(getDependsOn());
    long duration = ofNullable(getDependsDuration()).orElse(0L) / speed;
    Instant dependingStart = dependsOnInject
        .map(inject -> inject.computeInjectDate(source, speed))
        .orElse(source);
    Instant standardExecutionDate = dependingStart.plusSeconds(duration);
    // Compute execution dates with previous terminated pauses
    long previousPauseDelay = 0L;
    if (this.exercise != null) {
      previousPauseDelay = this.exercise.getPauses().stream()
          .filter(pause -> pause.getDate().isBefore(standardExecutionDate))
          .mapToLong(pause -> pause.getDuration().orElse(0L)).sum();
    }
    Instant afterPausesExecutionDate = standardExecutionDate.plusSeconds(previousPauseDelay);
    // Add current pause duration in date computation if needed
    long currentPauseDelay = 0L;
    if (this.exercise != null) {
      currentPauseDelay = this.exercise.getCurrentPause()
          .map(last -> last.isBefore(afterPausesExecutionDate) ? between(last, now()).getSeconds() : 0L)
          .orElse(0L);
    }
    long globalPauseDelay = previousPauseDelay + currentPauseDelay;
    long minuteAlignModulo = globalPauseDelay % 60;
    long alignedPauseDelay = minuteAlignModulo > 0 ? globalPauseDelay + (60 - minuteAlignModulo) : globalPauseDelay;
    return standardExecutionDate.plusSeconds(alignedPauseDelay);
  }

  @JsonProperty("inject_date")
  public Optional<Instant> getDate() {
    if (this.getExercise() == null && this.getScenario() == null) {
      return Optional.ofNullable(now().minusSeconds(30));
    }

    if (this.getScenario() != null) {
      return Optional.empty();
    }

    if (this.getExercise() != null) {
      if (this.getExercise().getStatus().equals(Exercise.STATUS.CANCELED)) {
        return Optional.empty();
      }
      return this.getExercise()
          .getStart()
          .map(source -> computeInjectDate(source, SPEED_STANDARD));
    }
    return Optional.ofNullable(LocalDateTime.now().toInstant(ZoneOffset.UTC));
  }

  @JsonIgnore
  public Inject getInject() {
    return this;
  }

  @JsonIgnore
  public boolean isNotExecuted() {
    return this.getStatus().isEmpty();
  }

  @JsonIgnore
  public boolean isPastInject() {
    return this.getDate().map(date -> date.isBefore(now())).orElse(false);
  }

  @JsonIgnore
  public boolean isFutureInject() {
    return this.getDate().map(date -> date.isAfter(now())).orElse(false);
  }
  // endregion

  public Optional<InjectStatus> getStatus() {
    return ofNullable(this.status);
  }

  public List<InjectExpectation> getUserExpectationsForArticle(User user, Article article) {
    return this.expectations.stream()
        .filter(execution -> execution.getType().equals(InjectExpectation.EXPECTATION_TYPE.ARTICLE))
        .filter(execution -> execution.getArticle().equals(article))
        .filter(execution -> execution.getTeam().getUsers().contains(user))
        .toList();
  }

  @JsonIgnore
  public DryInject toDryInject(Dryrun run) {
    DryInject dryInject = new DryInject();
    dryInject.setRun(run);
    dryInject.setInject(this);
    dryInject.setDate(computeInjectDate(run.getDate(), run.getSpeed()));
    return dryInject;
  }

  @JsonProperty("inject_communications_number")
  public long getCommunicationsNumber() {
    return this.getCommunications().size();
  }

  @JsonProperty("inject_communications_not_ack_number")
  public long getCommunicationsNotAckNumber() {
    return this.getCommunications().stream().filter(communication -> !communication.getAck()).count();
  }

  @JsonProperty("inject_sent_at")
  public Instant getSentAt() {
    if (this.getStatus().isPresent()) {
      return this.getStatus().orElseThrow().getTrackingSentDate();
    }
    return null;
  }

  @JsonProperty("inject_kill_chain_phases")
  public List<KillChainPhase> getKillChainPhases() {
    return this.getInjectorContract().getAttackPatterns().stream()
        .flatMap(attackPattern -> attackPattern.getKillChainPhases().stream()).distinct().toList();
  }

  @JsonProperty("inject_attack_patterns")
  public List<AttackPattern> getAttackPatterns() {
    return this.getInjectorContract().getAttackPatterns();
  }

  @JsonProperty("inject_type")
  @NotNull
  private String getType() { return this.getInjectorContract().getInjector().getType(); }

  @JsonIgnore
  public boolean isAtomicTesting() {
    return this.exercise == null && this.scenario == null;
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

  /**
   * Creates an Inject from a Raw Inject
   * @param rawInject the raw inject to convert
   * @param rawTeams the map of the teams containing at least the ones linked to this inject
   * @param rawInjectExpectationMap the map of the expectations containing at least the ones linked to this inject
   * @param mapOfAssetGroups the map of the asset groups containing at least the ones linked to this inject
   * @param mapOfAsset the map of the asset containing at least the ones linked to this inject and the asset groups linked to it
   * @return an Inject
   */
  public static Inject fromRawInject(RawInject rawInject,
                                     Map<String, RawTeam> rawTeams,
                                     Map<String, RawInjectExpectation> rawInjectExpectationMap,
                                     Map<String, RawAssetGroup> mapOfAssetGroups,
                                     Map<String, RawAsset> mapOfAsset) {
    // Create the object
    Inject inject = new Inject();
    inject.setId(rawInject.getInject_id());

    // Set a list of expectations
    inject.setExpectations(new ArrayList<>());
    for(String expectationId: rawInject.getInject_expectations()) {
      // Create a new expectation
      InjectExpectation expectation = new InjectExpectation();
      expectation.setId(rawInjectExpectationMap.get(expectationId).getInject_expectation_id());
      expectation.setType(InjectExpectation.EXPECTATION_TYPE.valueOf(rawInjectExpectationMap.get(expectationId).getInject_expectation_type()));
      expectation.setScore(rawInjectExpectationMap.get(expectationId).getInject_expectation_score());

      // Add the team of the expectation
      Team team = new Team();
      team.setId(rawInjectExpectationMap.get(expectationId).getTeam_id());
      team.setName(rawTeams.get(rawInjectExpectationMap.get(expectationId).getTeam_id()).getTeam_name());
      expectation.setTeam(team);

      // Add the asset group of the expectation
      AssetGroup assetGroup = new AssetGroup();
      RawAssetGroup rawAssetGroup = mapOfAssetGroups.get(rawInjectExpectationMap.get(expectationId).getAsset_group_id());
      if(rawAssetGroup != null) {
        assetGroup.setId(rawAssetGroup.getAsset_group_id());
        assetGroup.setName(rawAssetGroup.getAsset_group_name());
        assetGroup.setAssets(new ArrayList<>());

        // We add the assets to the asset group
        for (String assetId : rawAssetGroup.getAsset_ids()) {
          Asset asset = new Asset(mapOfAsset.get(assetId).getAsset_id(),
                  mapOfAsset.get(assetId).getAsset_type(),
                  mapOfAsset.get(assetId).getAsset_name());
          assetGroup.getAssets().add(asset);
        }
        expectation.setAssetGroup(assetGroup);
      }

      // We add the asset to the expectation
      if (rawInjectExpectationMap.get(expectationId).getAsset_id() != null) {
        Asset asset = new Asset(mapOfAsset.get(rawInjectExpectationMap.get(expectationId).getAsset_id()).getAsset_id(),
                mapOfAsset.get(rawInjectExpectationMap.get(expectationId).getAsset_id()).getAsset_type(),
                mapOfAsset.get(rawInjectExpectationMap.get(expectationId).getAsset_id()).getAsset_name());
        expectation.setAsset(asset);
      }
      inject.getExpectations().add(expectation);
    }

    // We add the teams to the inject
    ArrayList<Team> injectTeams = new ArrayList();
    for (String injectTeamId: rawInject.getInject_teams()) {
      Team team = new Team();
      team.setId(rawTeams.get(injectTeamId).getTeam_id());
      team.setName(rawTeams.get(injectTeamId).getTeam_name());
      injectTeams.add(team);
    }
    inject.setTeams(injectTeams);

    // We add the assets to the inject
    ArrayList<Asset> injectAssets = new ArrayList();
    for (String injectAssetId: rawInject.getInject_assets()) {
      Asset asset = new Asset(mapOfAsset.get(injectAssetId).getAsset_id(),
              mapOfAsset.get(injectAssetId).getAsset_type(),
              mapOfAsset.get(injectAssetId).getAsset_name());
      injectAssets.add(asset);
    }
    inject.setAssets(injectAssets);

    // Add the asset groups to the inject
    ArrayList<AssetGroup> injectAssetGroups = new ArrayList();
    for (String injectAssetGroupId: rawInject.getInject_asset_groups()) {
      AssetGroup assetGroup = new AssetGroup();
      assetGroup.setName(mapOfAssetGroups.get(injectAssetGroupId).getAsset_group_name());
      assetGroup.setId(mapOfAssetGroups.get(injectAssetGroupId).getAsset_group_id());
      // We add the assets linked to the asset group
      assetGroup.setAssets(mapOfAssetGroups.get(injectAssetGroupId).getAsset_ids().stream().map(
              assetId -> {
                Asset asset = new Asset(mapOfAsset.get(assetId).getAsset_id(),
                        mapOfAsset.get(assetId).getAsset_type(),
                        mapOfAsset.get(assetId).getAsset_name());
                return asset;
              }
      ).toList());
      injectAssetGroups.add(assetGroup);
    }
    inject.setAssetGroups(injectAssetGroups);

    return inject;
  }
}
