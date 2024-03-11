package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.InjectStatisticsHelper;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.helper.MultiIdDeserializer;
import io.openbas.helper.MultiModelDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.*;

import static io.openbas.database.model.Grant.GRANT_TYPE.OBSERVER;
import static io.openbas.database.model.Grant.GRANT_TYPE.PLANNER;
import static io.openbas.helper.UserHelper.getUsersByType;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

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
    @Column(name = "injector_contracts")
    @JsonProperty("injector_contracts")
    @NotBlank
    private String contracts;

    @Getter
    @Column(name = "injector_state")
    @JsonProperty("injector_state")
    private String state;

    @Getter
    @Column(name = "injector_created_at")
    @JsonProperty("injector_created_at")
    private Instant createdAt = now();

    @Getter
    @Column(name = "injector_updated_at")
    @JsonProperty("injector_updated_at")
    private Instant updatedAt = now();


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
