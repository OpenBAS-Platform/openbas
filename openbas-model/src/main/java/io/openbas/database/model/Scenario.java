package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.helper.InjectStatisticsHelper;
import io.openbas.helper.MultiIdListDeserializer;
import io.openbas.helper.MultiIdSetDeserializer;
import io.openbas.helper.MultiModelDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.*;

import static io.openbas.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openbas.database.model.Grant.GRANT_TYPE.PLANNER;
import static io.openbas.helper.UserHelper.getUsersByType;
import static java.time.Instant.now;
import static lombok.AccessLevel.NONE;

@Data
@Entity
@Table(name = "scenarios")
@EntityListeners(ModelBaseListener.class)
@NamedEntityGraphs({
    @NamedEntityGraph(
        name = "Scenario.tags-injects",
        attributeNodes = {
            @NamedAttributeNode("tags"),
            @NamedAttributeNode("injects")
        }
    )
})
public class Scenario implements Base {

  public enum SEVERITY {
    @JsonProperty("low")
    low,
    @JsonProperty("medium")
    medium,
    @JsonProperty("high")
    high,
    @JsonProperty("critical")
    critical,
  }

  @Id
  @UuidGenerator
  @Column(name = "scenario_id")
  @JsonProperty("scenario_id")
  @NotBlank
  private String id;

  @Column(name = "scenario_name")
  @JsonProperty("scenario_name")
  @Queryable(filterable = true, searchable = true, sortable = true)
  @NotBlank
  private String name;

  @Column(name = "scenario_description")
  @JsonProperty("scenario_description")
  private String description;

  @Column(name = "scenario_subtitle")
  @JsonProperty("scenario_subtitle")
  private String subtitle;

  @Column(name = "scenario_category")
  @JsonProperty("scenario_category")
  @Queryable(filterable = true, sortable = true, dynamicValues = true)
  private String category;

  @Column(name = "scenario_main_focus")
  @JsonProperty("scenario_main_focus")
  private String mainFocus;

  @Column(name = "scenario_severity")
  @Enumerated(EnumType.STRING)
  @JsonProperty("scenario_severity")
  @Queryable(filterable = true, sortable = true)
  private SEVERITY severity;

  @Column(name = "scenario_external_reference")
  @JsonProperty("scenario_external_reference")
  private String externalReference;

  @Column(name = "scenario_external_url")
  @JsonProperty("scenario_external_url")
  private String externalUrl;

  // -- RECURRENCE --

  @Column(name = "scenario_recurrence")
  @JsonProperty("scenario_recurrence")
  @Queryable(filterable = true)
  private String recurrence;

  @Column(name = "scenario_recurrence_start")
  @JsonProperty("scenario_recurrence_start")
  private Instant recurrenceStart;

  @Column(name = "scenario_recurrence_end")
  @JsonProperty("scenario_recurrence_end")
  private Instant recurrenceEnd;

  // -- MESSAGE --

  @Column(name = "scenario_message_header")
  @JsonProperty("scenario_message_header")
  private String header = "EXERCISE - EXERCISE - EXERCISE";

  @Column(name = "scenario_message_footer")
  @JsonProperty("scenario_message_footer")
  private String footer = "EXERCISE - EXERCISE - EXERCISE";

  @Column(name = "scenario_mail_from")
  @JsonProperty("scenario_mail_from")
  @Email
  @NotBlank
  private String from;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "scenario_mails_reply_to", joinColumns = @JoinColumn(name = "scenario_id"))
  @Column(name = "scenario_reply_to", nullable = false)
  @JsonProperty("scenario_mails_reply_to")
  private List<String> replyTos = new ArrayList<>();

  // -- AUDIT --

  @Column(name = "scenario_created_at")
  @JsonProperty("scenario_created_at")
  @NotNull
  private Instant createdAt = now();

  @Column(name = "scenario_updated_at")
  @JsonProperty("scenario_updated_at")
  @NotNull
  @Queryable(filterable = true, sortable = true)
  private Instant updatedAt = now();

  // -- RELATION --

  @OneToMany(mappedBy = "scenario", fetch = FetchType.EAGER)
  @JsonIgnore
  private List<Grant> grants = new ArrayList<>();

  @OneToMany(mappedBy = "scenario", fetch = FetchType.LAZY)
  @JsonProperty("scenario_injects")
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @Getter(NONE)
  private Set<Inject> injects = new HashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "scenarios_teams",
      joinColumns = @JoinColumn(name = "scenario_id"),
      inverseJoinColumns = @JoinColumn(name = "team_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("scenario_teams")
  private List<Team> teams = new ArrayList<>();

  @OneToMany(mappedBy = "scenario", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonProperty("scenario_teams_users")
  @JsonSerialize(using = MultiModelDeserializer.class)
  private List<ScenarioTeamUser> teamUsers = new ArrayList<>();

  @OneToMany(mappedBy = "scenario", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JsonIgnore
  private List<Objective> objectives = new ArrayList<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "scenarios_tags",
      joinColumns = @JoinColumn(name = "scenario_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @JsonSerialize(using = MultiIdSetDeserializer.class)
  @JsonProperty("scenario_tags")
  @Queryable(filterable = true, dynamicValues = true, path = "tags.id")
  private Set<Tag> tags = new HashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "scenarios_documents",
      joinColumns = @JoinColumn(name = "scenario_id"),
      inverseJoinColumns = @JoinColumn(name = "document_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("scenario_documents")
  private List<Document> documents = new ArrayList<>();

  @OneToMany(mappedBy = "scenario", fetch = FetchType.LAZY)
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("scenario_articles")
  private List<Article> articles = new ArrayList<>();

  @OneToMany(mappedBy = "scenario", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("scenario_lessons_categories")
  private List<LessonsCategory> lessonsCategories = new ArrayList<>();

  @OneToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "scenarios_exercises",
      joinColumns = @JoinColumn(name = "scenario_id"),
      inverseJoinColumns = @JoinColumn(name = "exercise_id"))
  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("scenario_exercises")
  private List<Exercise> exercises;

  @Getter
  @Column(name = "scenario_lessons_anonymized")
  @JsonProperty("scenario_lessons_anonymized")
  private boolean lessonsAnonymized = false;

  // -- LESSONS --

  public List<Inject> getInjects() {
    return new ArrayList<>(this.injects);
  }

  // -- SECURITY --

  @JsonProperty("scenario_planners")
  @JsonSerialize(using = MultiIdListDeserializer.class)
  public List<User> getPlanners() {
    return getUsersByType(this.getGrants(), PLANNER);
  }

  @JsonProperty("scenario_observers")
  @JsonSerialize(using = MultiIdListDeserializer.class)
  public List<User> getObservers() {
    return getUsersByType(this.getGrants(), PLANNER, OBSERVER);
  }

  // -- STATISTICS --

  @JsonProperty("scenario_injects_statistics")
  public Map<String, Long> getInjectStatistics() {
    return InjectStatisticsHelper.getInjectStatistics(this.getInjects());
  }

  @JsonProperty("scenario_all_users_number")
  public long usersAllNumber() {
    return getTeams().stream().mapToLong(Team::getUsersNumber).sum();
  }

  @JsonProperty("scenario_users_number")
  public long usersNumber() {
    return getTeamUsers().stream().map(ScenarioTeamUser::getUser).distinct().count();
  }

  @JsonProperty("scenario_users")
  @JsonSerialize(using = MultiIdListDeserializer.class)
  public List<User> getUsers() {
    return getTeamUsers().stream()
        .map(ScenarioTeamUser::getUser)
        .distinct()
        .toList();
  }

  @JsonProperty("scenario_communications_number")
  public long getCommunicationsNumber() {
    return getInjects().stream().mapToLong(Inject::getCommunicationsNumber).sum();
  }

  // -- CHANNELS --

  public List<Article> getArticlesForChannel(Channel channel) {
    return this.articles.stream()
        .filter(article -> article.getChannel().equals(channel))
        .toList();
  }

  // -- PLATFORMS --
  @JsonProperty("scenario_platforms")
  @Queryable(filterable = true, path = "injects.injectorContract.platforms", clazz = String[].class)
  public List<PLATFORM_TYPE> getPlatforms() {
    return getInjects().stream()
        .flatMap(inject -> inject.getInjectorContract()
            .map(InjectorContract::getPlatforms)
            .stream())
        .flatMap(Arrays::stream)
        .filter(Objects::nonNull)
        .distinct()
        .toList();
  }

  // -- KILL CHAIN PHASES --
  @JsonProperty("scenario_kill_chain_phases")
  @Queryable(filterable = true, dynamicValues = true, path = "injects.injectorContract.attackPatterns.killChainPhases.id")
  public List<KillChainPhase> getKillChainPhases() {
    return getInjects().stream()
        .flatMap(inject -> inject.getInjectorContract()
            .map(InjectorContract::getAttackPatterns)
            .stream()
            .flatMap(Collection::stream)
            .flatMap(attackPattern -> attackPattern.getKillChainPhases().stream()))
        .distinct()
        .toList();
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
