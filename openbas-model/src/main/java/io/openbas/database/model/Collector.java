package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static java.time.Instant.now;

@Setter
@Entity
@Table(name = "collectors")
@EntityListeners(ModelBaseListener.class)
public class Collector implements Base {

    @Getter
    @Id
    @Column(name = "collector_id")
    @JsonProperty("collector_id")
    @NotBlank
    private String id;

    @Getter
    @Column(name = "collector_name")
    @JsonProperty("collector_name")
    @NotBlank
    private String name;

    @Getter
    @Column(name = "collector_type")
    @JsonProperty("collector_type")
    @NotBlank
    private String type;

    @Getter
    @Column(name = "collector_period")
    @JsonProperty("collector_period")
    private int period;

    @Getter
    @Column(name = "collector_created_at")
    @JsonProperty("collector_created_at")
    private Instant createdAt = now();

    @Getter
    @Column(name = "collector_updated_at")
    @JsonProperty("collector_updated_at")
    private Instant updatedAt = now();

    @Getter
    @Column(name = "collector_last_execution")
    @JsonProperty("collector_last_execution")
    private Instant lastExecution;

    @JsonIgnore
    @Override
    public boolean isUserHasAccess(User user) {
        return user.isAdmin();
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
