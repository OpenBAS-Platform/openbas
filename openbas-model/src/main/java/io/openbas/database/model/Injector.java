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
@Table(name = "injectors")
@EntityListeners(ModelBaseListener.class)
public class Injector implements Base {

    @Getter
    @Id
    @Column(name = "injector_id")
    @JsonProperty("injector_id")
    @NotBlank
    private String id;

    @Getter
    @Column(name = "injector_name")
    @JsonProperty("injector_name")
    @NotBlank
    private String name;

    @Getter
    @Column(name = "injector_type")
    @JsonProperty("injector_type")
    @NotBlank
    private String type;

    @Getter
    @Column(name = "injector_created_at")
    @JsonProperty("injector_created_at")
    private Instant createdAt = now();

    @Getter
    @Column(name = "injector_updated_at")
    @JsonProperty("injector_updated_at")
    private Instant updatedAt = now();

    @Getter
    @OneToMany(mappedBy = "injector", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<InjectorContract> contracts = new ArrayList<>();

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
