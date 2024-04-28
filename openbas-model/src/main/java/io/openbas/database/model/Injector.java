package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

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
    @Column(name = "injector_category")
    @JsonProperty("injector_category")
    private String category;

    @Getter
    @Column(name = "injector_external")
    @JsonProperty("injector_external")
    private boolean external = false;

    @Getter
    @Column(name = "injector_custom_contracts")
    @JsonProperty("injector_custom_contracts")
    private boolean customContracts = false;

    @Getter
    @Column(name = "injector_simulation_agent")
    @JsonProperty("injector_simulation_agent")
    @Queryable(filterable = true, sortable = true)
    private boolean simulationAgent = false;

    @Type(StringArrayType.class)
    @Column(name = "injector_simulation_agent_platforms", columnDefinition = "text[]")
    @JsonProperty("injector_simulation_agent_platforms")
    private String[] simulationAgentPlatforms = new String[0];

    @Getter
    @Column(name = "injector_simulation_agent_doc")
    @JsonProperty("injector_simulation_agent_doc")
    private String simulationAgentDoc;

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
