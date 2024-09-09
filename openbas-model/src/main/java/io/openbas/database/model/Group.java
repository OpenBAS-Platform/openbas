package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiIdListDeserializer;
import io.openbas.helper.MultiModelDeserializer;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Setter
@Getter
@Entity
@Table(name = "groups")
@EntityListeners(ModelBaseListener.class)
public class Group implements Base {

    @Id
    @Column(name = "group_id")
    @GeneratedValue(generator = "UUID")
    @UuidGenerator
    @JsonProperty("group_id")
    @NotBlank
    private String id;

    @Queryable(sortable = true)
    @Column(name = "group_name")
    @JsonProperty("group_name")
    @NotBlank
    private String name;

    @Column(name = "group_description")
    @JsonProperty("group_description")
    private String description;

    @Queryable(sortable = true)
    @Column(name = "group_default_user_assign")
    @JsonProperty("group_default_user_assign")
    private boolean defaultUserAssignation;

    @JsonProperty("group_default_exercise_assign")
    @Enumerated(EnumType.STRING)
    @ElementCollection
    @CollectionTable(name = "groups_exercises_default_grants",
            joinColumns = @JoinColumn(name = "group_id"))
    private List<Grant.GRANT_TYPE> exercisesDefaultGrants = new ArrayList<>();

    @JsonProperty("group_default_scenario_assign")
    @Enumerated(EnumType.STRING)
    @ElementCollection
    @CollectionTable(name = "groups_scenarios_default_grants",
        joinColumns = @JoinColumn(name = "group_id"))
    private List<Grant.GRANT_TYPE> scenariosDefaultGrants = new ArrayList<>();

    @OneToMany(mappedBy = "group", fetch = FetchType.EAGER)
    @JsonProperty("group_grants")
    @JsonSerialize(using = MultiModelDeserializer.class)
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Grant> grants = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_groups",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiIdListDeserializer.class)
    @JsonProperty("group_users")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<User> users = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "groups_organizations",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "organization_id"))
    @JsonSerialize(using = MultiIdListDeserializer.class)
    @JsonProperty("group_organizations")
    private List<Organization> organizations = new ArrayList<>();

    // region transient
    @JsonProperty("group_default_exercise_planner")
    public boolean isDefaultExercisePlanner() {
        return exercisesDefaultGrants.contains(Grant.GRANT_TYPE.PLANNER);
    }

    @JsonProperty("group_default_exercise_observer")
    public boolean isDefaultExerciseObserver() {
        return exercisesDefaultGrants.contains(Grant.GRANT_TYPE.OBSERVER);
    }

    @JsonProperty("group_default_scenario_planner")
    public boolean isDefaultScenarioPlanner() {
        return scenariosDefaultGrants.contains(Grant.GRANT_TYPE.PLANNER);
    }

    @JsonProperty("group_default_scenario_observer")
    public boolean isDefaultScenarioObserver() {
        return scenariosDefaultGrants.contains(Grant.GRANT_TYPE.OBSERVER);
    }
    // endregion

    @Override
    public boolean isUserHasAccess(User user) {
        return users.contains(user);
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
