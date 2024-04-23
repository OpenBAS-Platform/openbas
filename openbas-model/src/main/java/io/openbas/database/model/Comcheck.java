package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "comchecks")
@EntityListeners(ModelBaseListener.class)
public class Comcheck implements Base {

    public enum COMCHECK_STATUS {
        RUNNING,
        EXPIRED,
        FINISHED
    }

    @Id
    @Column(name = "comcheck_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("comcheck_id")
    @NotBlank
    private String id;

    @Column(name = "comcheck_name")
    @JsonProperty("comcheck_name")
    private String name;

    @Column(name = "comcheck_start_date")
    @JsonProperty("comcheck_start_date")
    private Instant start;

    @Column(name = "comcheck_end_date")
    @JsonProperty("comcheck_end_date")
    private Instant end;

    @Column(name = "comcheck_state")
    @JsonProperty("comcheck_state")
    @Enumerated(EnumType.STRING)
    private COMCHECK_STATUS state = COMCHECK_STATUS.RUNNING;

    @Column(name = "comcheck_subject")
    @JsonProperty("comcheck_subject")
    private String subject;

    @Column(name = "comcheck_message")
    @JsonProperty("comcheck_message")
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comcheck_exercise")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("comcheck_exercise")
    private Exercise exercise;

    // CascadeType.ALL is required here because comcheck statuses are embedded
    @OneToMany(mappedBy = "comcheck", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("comcheck_statuses")
    private List<ComcheckStatus> comcheckStatus = new ArrayList<>();

    // region transient
    @JsonProperty("comcheck_users_number")
    public long getUsersNumber() {
        return getComcheckStatus().size(); // One status for each user.
    }
    // endregion

    public String getId() {
        return id;
    }

    @Override
    public boolean isUserHasAccess(User user) {
        return exercise.isUserHasAccess(user);
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

    public Instant getStart() {
        return start;
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    public Instant getEnd() {
        return end;
    }

    public void setEnd(Instant end) {
        this.end = end;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public COMCHECK_STATUS getState() {
        return state;
    }

    public void setState(COMCHECK_STATUS state) {
        this.state = state;
    }

    public List<ComcheckStatus> getComcheckStatus() {
        return comcheckStatus;
    }

    public void setComcheckStatus(List<ComcheckStatus> comcheckStatus) {
        this.comcheckStatus = comcheckStatus;
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
