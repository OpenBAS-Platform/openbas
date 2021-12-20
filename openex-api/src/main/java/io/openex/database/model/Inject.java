package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.repository.InjectReportingRepository;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import io.openex.model.Execution;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static java.util.Optional.ofNullable;

@Entity
@Table(name = "injects")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "inject_type")
public abstract class Inject<T> extends Injection<T> implements Base {

    @Id
    @Column(name = "inject_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("inject_id")
    private String id;

    @Column(name = "inject_title")
    @JsonProperty("inject_title")
    private String title;

    @Column(name = "inject_description")
    @JsonProperty("inject_description")
    private String description;

    @Column(name = "inject_latitude")
    @JsonProperty("inject_latitude")
    private Double latitude;

    @Column(name = "inject_longitude")
    @JsonProperty("inject_longitude")
    private Double longitude;

    @Column(name = "inject_enabled")
    @JsonProperty("inject_enabled")
    private boolean enabled = true;

    @Column(name = "inject_type", insertable = false, updatable = false)
    @JsonProperty("inject_type")
    private String type;

    @Column(name = "inject_all_audiences")
    @JsonProperty("inject_all_audiences")
    private boolean allAudiences;

    @ManyToOne
    @JoinColumn(name = "inject_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("inject_exercise")
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "inject_depends_from_another")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("inject_depends_on")
    private Inject<?> dependsOn;

    @Column(name = "inject_depends_duration")
    @JsonProperty("inject_depends_duration")
    private Long dependsDuration;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JoinColumn(name = "inject_user")
    @JsonProperty("inject_user")
    private User user;

    @OneToOne(mappedBy = "inject", fetch = FetchType.EAGER)
    @JsonProperty("inject_status")
    private InjectStatus status;

    @OneToOne(mappedBy = "inject", fetch = FetchType.EAGER)
    @JsonProperty("inject_outcome")
    private Outcome outcome;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "injects_audiences",
            joinColumns = @JoinColumn(name = "inject_id"),
            inverseJoinColumns = @JoinColumn(name = "audience_id"))
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("inject_audiences")
    @Fetch(FetchMode.SUBSELECT)
    private List<Audience> audiences = new ArrayList<>();

    @Deprecated
    @Column(name = "inject_date")
    @JsonProperty("inject_date")
    private Date date;

    @Transient
    private InjectReportingRepository<T> statusRepository;

    // region transient
    @JsonProperty("inject_users_number")
    public long getNumberOfTargetUsers() {
        // TODO Handle all audiences count
        return getAudiences().stream()
                .map(Audience::getUsersNumber)
                .reduce(Long::sum).orElse(0L);
    }

    @JsonProperty("inject_date")
    public Date getDate() {
        Inject<?> dependsOnInject = getDependsOn();
        long duration = ofNullable(getDependsDuration()).orElse(0L);
        Date start = dependsOnInject == null ? getExercise().getStart() : dependsOnInject.getDate();
        return Date.from(start.toInstant().plusSeconds(duration));
    }

    @Deprecated
    public void setDate(Date date) {
        this.date = date;
    }

    @JsonIgnore
    public Date accelerateDate(Date beginFrom, int speed) {
        Inject<?> dependsOnInject = getDependsOn();
        long duration = ofNullable(getDependsDuration()).orElse(0L) / speed;
        Date start = dependsOnInject == null ? beginFrom : dependsOnInject.getDate();
        return Date.from(start.toInstant().plusSeconds(duration));
    }

    @JsonIgnore
    public Inject<T> setStatusRepository(InjectReportingRepository<T> statusRepository) {
        this.statusRepository = statusRepository;
        return this;
    }

    @Override
    public void report(Execution execution) {
        statusRepository.executionSave(execution, this);
    }
    // endregion

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Outcome getOutcome() {
        return outcome;
    }

    public void setOutcome(Outcome outcome) {
        this.outcome = outcome;
    }

    @Override
    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public InjectStatus getStatus() {
        return status;
    }

    public void setStatus(InjectStatus status) {
        this.status = status;
    }

    public boolean isAllAudiences() {
        return allAudiences;
    }

    public void setAllAudiences(boolean allAudiences) {
        this.allAudiences = allAudiences;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Inject<?> getDependsOn() {
        return dependsOn;
    }

    public void setDependsOn(Inject<?> dependsOn) {
        this.dependsOn = dependsOn;
    }

    public Long getDependsDuration() {
        return dependsDuration;
    }

    public void setDependsDuration(Long dependsDuration) {
        this.dependsDuration = dependsDuration;
    }

    public abstract void setContent(T content);

    @JsonIgnore
    public abstract DryInject<T> toDryInject(Dryrun run, Date from, int speed);

    @Override
    @JsonProperty("inject_audiences")
    public List<Audience> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<Audience> audiences) {
        this.audiences = audiences;
    }

    @Override
    public boolean isGlobalInject() {
        return isAllAudiences();
    }

    public enum STATUS {
        SUCCESS
    }
}
