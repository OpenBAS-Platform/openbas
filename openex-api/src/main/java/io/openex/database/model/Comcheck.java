package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
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
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("comcheck_id")
    private String id;

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

    @Column(name = "comcheck_signature")
    @JsonProperty("comcheck_signature")
    private String signature;

    @ManyToOne
    @JoinColumn(name = "comcheck_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("comcheck_exercise")
    private Exercise exercise;

    @OneToMany(mappedBy = "comcheck", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonSerialize(using = MultiModelDeserializer.class)
    @JsonProperty("comcheck_status")
    private List<ComcheckStatus> comcheckStatus = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
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
