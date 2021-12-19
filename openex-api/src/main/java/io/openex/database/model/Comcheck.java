package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "comchecks")
public class Comcheck implements Base {
    @Id
    @Column(name = "comcheck_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("comcheck_id")
    private String id;

    @Column(name = "comcheck_start_date")
    @JsonProperty("comcheck_start_date")
    private Date start;

    @Column(name = "comcheck_end_date")
    @JsonProperty("comcheck_end_date")
    private Date end;

    @ManyToOne
    @JoinColumn(name = "comcheck_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("comcheck_exercise")
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "comcheck_audience")
    @JsonProperty("comcheck_audience")
    private Audience audience;

    @OneToMany(mappedBy = "comcheck", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ComcheckStatus> comcheckStatus = new ArrayList<>();

    // region transient
    @JsonProperty("comcheck_finished")
    public boolean isFinished() {
        return new Date().after(getEnd()) || comcheckStatus.stream().allMatch(ComcheckStatus::isState);
    }
    // endregion

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public Audience getAudience() {
        return audience;
    }

    public void setAudience(Audience audience) {
        this.audience = audience;
    }

    public List<ComcheckStatus> getComcheckStatus() {
        return comcheckStatus;
    }

    public void setComcheckStatus(List<ComcheckStatus> comcheckStatus) {
        this.comcheckStatus = comcheckStatus;
    }
}
