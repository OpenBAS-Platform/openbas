package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.*;

import static io.openex.config.AppConfig.currentUser;
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

    @ManyToOne
    @JoinColumn(name = "exercise_image")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("exercise_image")
    private Document image;

    @Column(name = "exercise_message_header")
    @JsonProperty("exercise_message_header")
    private String header = "EXERCISE - EXERCISE - EXERCISE";

    @Column(name = "exercise_message_footer")
    @JsonProperty("exercise_message_footer")
    private String footer = "EXERCISE - EXERCISE - EXERCISE";

    @Column(name = "exercise_mail_from")
    @JsonProperty("exercise_mail_from")
    private String replyTo = "planners@openex.io";

    @Column(name = "exercise_created_at")
    @JsonProperty("exercise_created_at")
    private Instant createdAt = now();

    @Column(name = "exercise_updated_at")
    @JsonProperty("exercise_updated_at")
    private Instant updatedAt = now();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Audience> audiences = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Grant> grants = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Inject<?>> injects = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Objective> objectives = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @JsonProperty("exercise_pauses")
    @JsonSerialize(using = MultiModelDeserializer.class)
    @Fetch(FetchMode.SUBSELECT)
    private List<Pause> pauses = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "exercises_tags",
            joinColumns = @JoinColumn(name = "exercise_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("exercise_tags")
    @Fetch(FetchMode.SUBSELECT)
    private List<Tag> tags = new ArrayList<>();

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
                .flatMap(group -> group.getUsers().stream()).toList();
    }

    @JsonIgnore
    public List<User> getPlanners() {
        return getUsersByType(PLANNER);
    }

    @JsonIgnore
    public List<User> getObservers() {
        return getUsersByType(PLANNER, OBSERVER);
    }

    @JsonIgnore
    @Override
    public boolean isUserObserver(User user) {
        return user.isAdmin() || getObservers().stream().map(User::getId).anyMatch(u -> u.equals(user.getId()));
    }

    @JsonProperty("exercise_users_number")
    public long usersNumber() {
        return getAudiences().stream()
                .mapToLong(audience -> audience.getUsers().size()).sum();
    }

    @JsonProperty("user_can_update")
    public boolean isUserCanUpdate() {
        User user = currentUser();
        return user.isAdmin() || getPlanners().stream().anyMatch(u -> u.getId().equals(user.getId()));
    }

    @JsonProperty("user_can_delete")
    public boolean isUserCanDelete() {
        return currentUser().isAdmin();
    }

    @JsonProperty("exercise_next_possible_status")
    public List<STATUS> nextPossibleStatus() {
        // FINISHED ?
        if (STATUS.CANCELED.equals(status)) {
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

    public Document getImage() {
        return image;
    }

    public void setImage(Document image) {
        this.image = image;
    }

    public List<Inject<?>> getInjects() {
        return injects.stream().sorted(Inject.executionComparator).toList();
    }

    public void setInjects(List<Inject<?>> injects) {
        this.injects = injects;
    }

    public List<Pause> getPauses() {
        return pauses;
    }

    public void setPauses(List<Pause> pauses) {
        this.pauses = pauses;
    }

    public void addPause(Pause pause) {
        this.pauses.add(pause);
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

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}
