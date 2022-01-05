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

import javax.annotation.Nullable;
import javax.persistence.*;
import java.util.*;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openex.database.model.Grant.GRANT_TYPE.PLANNER;
import static java.util.Arrays.stream;

@Entity
@Table(name = "exercises")
@EntityListeners(ModelBaseListener.class)
public class Exercise implements Base {

    private enum STATUS {
        CANCELED,
        SCHEDULED,
        RUNNING,
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

    @Column(name = "exercise_subtitle")
    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @Column(name = "exercise_start_date")
    @JsonProperty("exercise_start_date")
    private Date start;

    @Column(name = "exercise_end_date")
    @JsonProperty("exercise_end_date")
    private Date end;

    @Column(name = "exercise_canceled")
    @JsonProperty("exercise_canceled")
    private boolean canceled = false;

    @ManyToOne
    @JoinColumn(name = "exercise_owner")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("exercise_owner")
    private User owner;

    @ManyToOne
    @JoinColumn(name = "exercise_image")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("exercise_image")
    private Document image;

    @OneToOne
    @JoinColumn(name = "exercise_animation_group")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("exercise_animation_group")
    private Group animationGroup;

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
    private Date createdAt = new Date();

    @Column(name = "exercise_updated_at")
    @JsonProperty("exercise_updated_at")
    private Date updatedAt = new Date();

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
        Date now = new Date();
        long total = injects.size();
        stats.put("total_count", total);
        long executed = injects.stream().filter(inject -> inject.getStatus() != null).count();
        stats.put("total_executed", executed);
        stats.put("total_remaining", injects.stream().filter(inject -> inject.getStatus() == null).count());
        stats.put("total_past", injects.stream().filter(inject -> inject.getDate().before(now)).count());
        stats.put("total_future", injects.stream().filter(inject -> inject.getDate().after(now)).count());
        stats.put("total_progress", total > 0 ? (executed * 100 / total) : 0);
        return stats;
    }

    @JsonProperty("exercise_status")
    public String getStatus() {
        if (isCanceled()) {
            return STATUS.CANCELED.name();
        }
        Date now = new Date();
        long totalCount = getInjects().size();
        List<Inject<?>> injectsToExecute = getInjects().stream().filter(inject -> inject.getStatus() == null).toList();
        long totalPastCount = injectsToExecute.stream().filter(inject -> inject.getDate().before(now)).count();
        long totalFutureCount = injectsToExecute.stream().filter(inject -> inject.getDate().after(now)).count();
        if (totalCount == 0 || (totalPastCount == 0 && totalFutureCount > 0)) {
            return STATUS.SCHEDULED.name();
        } else if (totalFutureCount > 0) {
            return STATUS.RUNNING.name();
        }
        return STATUS.FINISHED.name();
    }

    private List<User> getUsersByType(String... types) {
        List<Grant> grants = getGrants();
        return grants.stream()
                .filter(grant -> stream(types).anyMatch(s -> grant.getName().equals(s)))
                .map(Grant::getGroup)
                .flatMap(group -> group.getUsers().stream()).toList();
    }

    @JsonIgnore
    public List<User> getPlanners() {
        return getUsersByType(PLANNER.name());
    }

    @JsonIgnore
    public List<User> getObservers() {
        return getUsersByType(PLANNER.name(), OBSERVER.name());
    }

    @JsonIgnore
    @Override
    public boolean isUserObserver(User user) {
        return user.isAdmin() || getObservers().stream().map(User::getId).anyMatch(u -> u.equals(user.getId()));
    }

    @JsonProperty("exercise_users_number")
    public long usersNumber() {
        return getAudiences().stream()
                .map(audience -> audience.getUsers().stream()).count();
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

    public boolean isCanceled() {
        return canceled;
    }

    public void setCanceled(boolean canceled) {
        this.canceled = canceled;
    }

    public Group getAnimationGroup() {
        return animationGroup;
    }

    public void setAnimationGroup(Group animationGroup) {
        this.animationGroup = animationGroup;
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

    public @Nullable Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public @Nullable Date getEnd() {
        return end;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setEnd(Date end) {
        this.end = end;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Document getImage() {
        return image;
    }

    public void setImage(Document image) {
        this.image = image;
    }

    public List<Inject<?>> getInjects() {
        return injects;
    }

    public void setInjects(List<Inject<?>> injects) {
        this.injects = injects;
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
