package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Setter
@Getter
@Entity
@Table(name = "injects_dependencies")
public class InjectDependency {

    @EmbeddedId
    @JsonProperty("dependency_relationship")
    private InjectDependencyId compositeId = new InjectDependencyId();

    @Column(name = "dependency_condition")
    @JsonProperty("dependency_condition")
    private String condition;

    @CreationTimestamp
    @Column(name = "dependency_created_at")
    @JsonProperty("dependency_created_at")
    private Instant creationDate;

    @UpdateTimestamp
    @Column(name = "dependency_updated_at")
    @JsonProperty("dependency_updated_at")
    private Instant updateDate;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InjectDependency that = (InjectDependency) o;
        return compositeId.equals(that.compositeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(compositeId);
    }
}
