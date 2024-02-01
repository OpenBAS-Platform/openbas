package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.InjectStatisticsHelper;
import io.openex.helper.MonoIdDeserializer;
import io.openex.helper.MultiIdDeserializer;
import io.openex.helper.MultiModelDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.*;

import static io.openex.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openex.database.model.Grant.GRANT_TYPE.PLANNER;
import static io.openex.helper.UserHelper.getUsersByType;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

@Setter
@Entity
@Table(name = "exercises")
@EntityListeners(ModelBaseListener.class)
public class Exercise implements Base {

    public enum STATUS {
        SCHEDULED,
        CANCELED,
        RUNNING,
        PAUSED,
        FINISHED
    }

    @Getter
    @Id
    @Column(name = "exercise_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("exercise_id")
    private String id;

    @Getter
    @Column(name = "exercise_name")
    @JsonProperty("exercise_name")
    @NotBlank
    private String name;

    @Getter
    @Column(name = "exercise_description")
    @JsonProperty("exercise_description")
    private String description;

    @Getter
    @Column(name = "exercise_status")
    @JsonProperty("exercise_status")
    @Enumerated(EnumType.STRING)
    private STATUS status = STATUS.SCHEDULED;

    @Getter
    @Column(name = "exercise_subtitle")
    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @Column(name = "exercise_pause_date")
    @JsonIgnore
    private Instant currentPause;

    @Column(name = "exercise_start_date")
    @JsonProperty("exercise_start_date")
    private Instant start;

    @Column(name = "exercise_end_date")
    @JsonProperty("exercise_end_date")
    private Instant end;

    @Getter
    @Column(name = "exercise_message_header")
    @JsonProperty("exercise_message_header")
    private String header = "EXERCISE - EXERCISE - EXERCISE";

    @Getter
    @Column(name = "exercise_message_footer")
    @JsonProperty("exercise_message_footer")
    private String footer = "EXERCISE - EXERCISE - EXERCISE";

    @Getter
    @Column(name = "exercise_mail_from")
    @JsonProperty("exercise_mail_from")
    private String replyTo;

    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_logo_dark")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("exercise_logo_dark")
    private Document logoDark;

    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_logo_light")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("exercise_logo_light")
    private Document logoLight;

    @Getter
    @Column(name = "exercise_lessons_anonymized")
    @JsonProperty("exercise_lessons_anonymized")
    private boolean lessonsAnonymized = false;

    @Getter
    @Column(name = "exercise_created_at")
    @JsonProperty("exercise_created_at")
    private Instant createdAt = now();

    @Getter
    @Column(name = "exercise_updated_at")
    @JsonProperty("exercise_updated_at")
    private Instant updatedAt = now();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @JsonIgnore
    private List<Grant> grants = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonProperty("exercise_injects")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<Inject> injects = new ArrayList<>();

    @Getter
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_teams",
            joinColumns = @JoinColumn(name = "exercise_id"),
            inverseJoinColumns = @JoinColumn(name = "team_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_teams")
    private List<Team> teams = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("exercise_teams_users")
    @JsonSerialize(using = MultiModelDeserializer.class)
    private List<ExerciseTeamUser> teamUsers = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Objective> objectives = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Log> logs = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonProperty("exercise_pauses")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<Pause> pauses = new ArrayList<>();

    @Getter
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_tags",
            joinColumns = @JoinColumn(name = "exercise_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_tags")
    private List<Tag> tags = new ArrayList<>();

    @Getter
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_documents",
            joinColumns = @JoinColumn(name = "exercise_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_documents")
    private List<Document> documents = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_articles")
    private List<Article> articles = new ArrayList<>();

    @Getter
    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_lessons_categories")
    private List<LessonsCategory> lessonsCategories = new ArrayList<>();

    // region transient
    @JsonProperty("exercise_injects_statistics")
    public Map<String, Long> getInjectStatistics() {
        return InjectStatisticsHelper.getInjectStatistics(this.getInjects());
    }

    @JsonProperty("exercise_lessons_answers_number")
    public Long getLessonsAnswersNumbers() {
        return getLessonsCategories().stream().flatMap(lessonsCategory -> lessonsCategory.getQuestions()
                .stream().flatMap(lessonsQuestion -> lessonsQuestion.getAnswers().stream())).count();
    }

    @JsonProperty("exercise_planners")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<User> getPlanners() {
        return getUsersByType(this.getGrants(), PLANNER);
    }

    @JsonProperty("exercise_observers")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<User> getObservers() {
        return getUsersByType(this.getGrants(), PLANNER, OBSERVER);
    }

    @JsonProperty("exercise_next_inject_date")
    public Optional<Instant> getNextInjectExecution() {
        return getInjects().stream()
                .filter(inject -> inject.getStatus().isEmpty())
                .filter(inject -> inject.getDate().isPresent())
                .filter(inject -> inject.getDate().get().isAfter(now()))
                .findFirst().flatMap(Inject::getDate);
    }

    @JsonIgnore
    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin() || getObservers().contains(user);
    }

    @JsonProperty("exercise_all_users_number")
    public long usersAllNumber() {
        return getTeams().stream().mapToLong(Team::getUsersNumber).sum();
    }

    @JsonProperty("exercise_users_number")
    public long usersNumber() {
        return getTeamUsers().stream().map(ExerciseTeamUser::getUser).distinct().count();
    }

    @JsonProperty("exercise_users")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<User> getUsers() {
        return getTeamUsers().stream().map(ExerciseTeamUser::getUser).distinct().toList();
    }

    @JsonProperty("exercise_score")
    public Double getEvaluationAverage() {
        double evaluationAverage = getObjectives().stream().mapToDouble(Objective::getEvaluationAverage).average().orElse(0D);
        return Math.round(evaluationAverage * 100.0) / 100.0;
    }

    @JsonProperty("exercise_logs_number")
    public long getLogsNumber() {
        return getLogs().size();
    }

    @JsonProperty("exercise_communications_number")
    public long getCommunicationsNumber() {
        return getInjects().stream().mapToLong(Inject::getCommunicationsNumber).sum();
    }

    @JsonProperty("exercise_next_possible_status")
    public List<STATUS> nextPossibleStatus() {
        if (STATUS.CANCELED.equals(status)) {
            return List.of(STATUS.SCHEDULED); // Via reset
        }
        if (STATUS.FINISHED.equals(status)) {
            return List.of(STATUS.SCHEDULED); // Via reset
        }
        if (STATUS.SCHEDULED.equals(status)) {
            return List.of(STATUS.RUNNING);
        }
        if (STATUS.RUNNING.equals(status)) {
            return List.of(STATUS.CANCELED, STATUS.PAUSED);
        }
        if (STATUS.PAUSED.equals(status)) {
            return List.of(STATUS.CANCELED, STATUS.RUNNING);
        }
        return List.of();
    }
    // endregion

    public Optional<Instant> getStart() {
        return ofNullable(start);
    }

    public Optional<Instant> getEnd() {
        return ofNullable(end);
    }

    public Optional<Instant> getCurrentPause() {
        return ofNullable(currentPause);
    }

    public List<Inject> getInjects() {
        return injects.stream().sorted(Inject.executionComparator).toList();
    }

    public List<Article> getArticlesForChannel(Channel channel) {
        return articles.stream().filter(article -> article.getChannel().equals(channel)).toList();
    }

    @Override
    public String toString() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !Base.class.isAssignableFrom(o.getClass())) return false;
        Base base = (Base) o;
        return id.equals(base.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
