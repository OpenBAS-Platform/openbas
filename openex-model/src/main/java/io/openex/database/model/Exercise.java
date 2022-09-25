package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import io.openex.helper.MultiIdDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.*;

import static io.openex.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openex.database.model.Grant.GRANT_TYPE.PLANNER;
import static java.time.Instant.now;
import static java.util.Arrays.asList;
import static java.util.Optional.ofNullable;

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

    @Id
    @Column(name = "exercise_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("exercise_id")
    private String id;

    @Column(name = "exercise_name")
    @JsonProperty("exercise_name")
    private String name;

    @Column(name = "exercise_description")
    @JsonProperty("exercise_description")
    private String description;

    @Column(name = "exercise_status")
    @JsonProperty("exercise_status")
    @Enumerated(EnumType.STRING)
    private STATUS status = STATUS.SCHEDULED;

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

    @Column(name = "exercise_message_header")
    @JsonProperty("exercise_message_header")
    private String header = "EXERCISE - EXERCISE - EXERCISE";

    @Column(name = "exercise_message_footer")
    @JsonProperty("exercise_message_footer")
    private String footer = "EXERCISE - EXERCISE - EXERCISE";

    @Column(name = "exercise_mail_from")
    @JsonProperty("exercise_mail_from")
    private String replyTo = "planners@openex.io";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_logo_dark")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("exercise_logo_dark")
    private Document logoDark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_logo_light")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("exercise_logo_light")
    private Document logoLight;

    @Column(name = "exercise_lessons_anonymized")
    @JsonProperty("exercise_lessons_anonymized")
    private boolean lessonsAnonymized = false;

    @Column(name = "exercise_created_at")
    @JsonProperty("exercise_created_at")
    private Instant createdAt = now();

    @Column(name = "exercise_updated_at")
    @JsonProperty("exercise_updated_at")
    private Instant updatedAt = now();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Audience> audiences = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Grant> grants = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonProperty("exercise_injects")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<Inject> injects = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Objective> objectives = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Log> logs = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonProperty("exercise_pauses")
    @JsonSerialize(using = MultiIdDeserializer.class)
    private List<Pause> pauses = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_tags",
            joinColumns = @JoinColumn(name = "exercise_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_tags")
    private List<Tag> tags = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_documents",
            joinColumns = @JoinColumn(name = "exercise_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_documents")
    private List<Document> documents = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("exercise_articles")
    private List<Article> articles = new ArrayList<>();

    // region transient
    @JsonProperty("exercise_injects_statistics")
    public Map<String, Long> getInjectStatistics() {
        Map<String, Long> stats = new HashMap<>();
        long total = injects.size();
        stats.put("total_count", total);
        long executed = injects.stream().filter(inject -> inject.getStatus().isPresent()).count();
        stats.put("total_executed", executed);
        stats.put("total_remaining", injects.stream().filter(Inject::isNotExecuted).count());
        stats.put("total_past", injects.stream().filter(Inject::isPastInject).count());
        stats.put("total_future", injects.stream().filter(Inject::isFutureInject).count());
        stats.put("total_progress", total > 0 ? (executed * 100 / total) : 0);
        return stats;
    }

    private List<User> getUsersByType(Grant.GRANT_TYPE... types) {
        List<Grant> grants = getGrants();
        return grants.stream()
                .filter(grant -> asList(types).contains(grant.getName()))
                .map(Grant::getGroup)
                .flatMap(group -> group.getUsers().stream())
                .distinct()
                .toList();
    }

    @JsonProperty("exercise_planners")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<User> getPlanners() {
        return getUsersByType(PLANNER);
    }

    @JsonProperty("exercise_observers")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<User> getObservers() {
        return getUsersByType(PLANNER, OBSERVER);
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

    @JsonProperty("exercise_users_number")
    public long usersNumber() {
        return getAudiences().stream().mapToLong(audience -> audience.getUsers().size()).sum();
    }

    @JsonProperty("exercise_players")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<User> getPlayers() {
        return getAudiences().stream().flatMap(audience -> audience.getUsers().stream())
                .distinct()
                .toList();
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public STATUS getStatus() {
        return status;
    }

    public void setStatus(STATUS status) {
        this.status = status;
    }

    public String getHeader() {
        return header;
    }

    public void setHeader(String header) {
        this.header = header;
    }

    public String getFooter() {
        return footer;
    }

    public void setFooter(String footer) {
        this.footer = footer;
    }

    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public boolean isLessonsAnonymized() {
        return lessonsAnonymized;
    }

    public void setLessonsAnonymized(boolean lessonsAnonymized) {
        this.lessonsAnonymized = lessonsAnonymized;
    }

    public Optional<Instant> getStart() {
        return ofNullable(start);
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    public Optional<Instant> getEnd() {
        return ofNullable(end);
    }

    public Optional<Instant> getCurrentPause() {
        return ofNullable(currentPause);
    }

    public void setCurrentPause(Instant currentPause) {
        this.currentPause = currentPause;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setEnd(Instant end) {
        this.end = end;
    }

    public Document getLogoDark() {
        return logoDark;
    }

    public void setLogoDark(Document logoDark) {
        this.logoDark = logoDark;
    }

    public Document getLogoLight() {
        return logoLight;
    }

    public void setLogoLight(Document logoLight) {
        this.logoLight = logoLight;
    }

    public List<Inject> getInjects() {
        return injects.stream().sorted(Inject.executionComparator).toList();
    }

    public void setInjects(List<Inject> injects) {
        this.injects = injects;
    }

    public List<Pause> getPauses() {
        return pauses;
    }

    public void setPauses(List<Pause> pauses) {
        this.pauses = pauses;
    }

    public List<Audience> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<Audience> audiences) {
        this.audiences = audiences;
    }

    public List<Grant> getGrants() {
        return grants;
    }

    public void setGrants(List<Grant> grants) {
        this.grants = grants;
    }

    public List<Objective> getObjectives() {
        return objectives;
    }

    public void setObjectives(List<Objective> objectives) {
        this.objectives = objectives;
    }

    public List<Log> getLogs() {
        return logs;
    }

    public void setLogs(List<Log> logs) {
        this.logs = logs;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public List<Article> getArticles() {
        return articles;
    }

    public List<Article> getArticlesForMedia(Media media) {
        return articles.stream().filter(article -> article.getMedia().equals(media)).toList();
    }

    public void setArticles(List<Article> articles) {
        this.articles = articles;
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
