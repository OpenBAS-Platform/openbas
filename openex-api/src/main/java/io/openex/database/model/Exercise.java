package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openex.database.model.Grant.GRANT_TYPE.PLANNER;
import static java.util.Arrays.stream;

@Entity
@Table(name = "exercises")
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
    private File image;

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

    @Column(name = "exercise_mail_expediteur")
    @JsonProperty("exercise_mail_expediteur")
    private String replyTo = "planners@openex.io";

    @Column(name = "exercise_type")
    @JsonProperty("exercise_type")
    private String type = "standard";

    @Column(name = "exercise_latitude")
    @JsonProperty("exercise_latitude")
    private Double latitude;

    @Column(name = "exercise_longitude")
    @JsonProperty("exercise_longitude")
    private Double longitude;

    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Grant> grants = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Event> events = new ArrayList<>();

    @OneToMany(mappedBy = "exercise", fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    @JsonIgnore
    private List<Objective> objectives = new ArrayList<>();

    // region transient
    @JsonProperty("exercise_status")
    public String getStatus() {
        if (isCanceled()) {
            return STATUS.CANCELED.name();
        }
        Date now = new Date();
        List<Inject<?>> injects = getEvents().stream()
                .flatMap(event -> event.getIncidents().stream())
                .flatMap(incident -> incident.getInjects().stream())
                .filter(inject -> inject.getStatus() == null).toList();
        long totalPastCount = injects.stream().filter(inject -> inject.getDate().before(now)).count();
        long totalFutureCount = injects.stream().filter(inject -> inject.getDate().after(now)).count();
        if (totalPastCount == 0 && totalFutureCount > 0) {
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

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
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

    public File getImage() {
        return image;
    }

    public void setImage(File file) {
        this.image = file;
    }

    public List<Grant> getGrants() {
        return grants;
    }

    public void setGrants(List<Grant> grants) {
        this.grants = grants;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    public List<Objective> getObjectives() {
        return objectives;
    }

    public void setObjectives(List<Objective> objectives) {
        this.objectives = objectives;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
