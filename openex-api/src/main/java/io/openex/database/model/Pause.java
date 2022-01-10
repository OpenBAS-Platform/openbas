package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoModelDeserializer;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

@Entity
@Table(name = "pauses")
@EntityListeners(ModelBaseListener.class)
public class Pause implements Base {
    @Id
    @Column(name = "pause_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("log_id")
    private String id;

    @Column(name = "pause_date")
    @JsonProperty("pause_date")
    private Instant date;

    @Column(name = "pause_duration")
    @JsonProperty("pause_duration")
    private Long duration = 0L;

    @ManyToOne
    @JoinColumn(name = "pause_exercise")
    @JsonSerialize(using = MonoModelDeserializer.class)
    @JsonProperty("pause_exercise")
    private Exercise exercise;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Optional<Long> getDuration() {
        return Optional.ofNullable(duration);
    }

    public void setDuration(Long duration) {
        this.duration = duration;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
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
