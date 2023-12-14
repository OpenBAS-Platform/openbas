package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MultiIdDeserializer;
import io.openex.helper.MultiModelDeserializer;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "groups")
@EntityListeners(ModelBaseListener.class)
public class Group implements Base {
    @Id
    @Column(name = "group_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @JsonProperty("group_id")
    private String id;

    @Column(name = "group_name")
    @JsonProperty("group_name")
    private String name;

    @Column(name = "group_description")
    @JsonProperty("group_description")
    private String description;

    @Column(name = "group_default_user_assign")
    @JsonProperty("group_default_user_assign")
    private boolean defaultUserAssignation;

    @JsonProperty("group_default_exercise_assign")
    @Enumerated(EnumType.STRING)
    @ElementCollection
    @CollectionTable(name = "groups_exercises_default_grants",
            joinColumns = @JoinColumn(name = "group_id"))
    private List<Grant.GRANT_TYPE> exercisesDefaultGrants = new ArrayList<>();

    @OneToMany(mappedBy = "group", fetch = FetchType.EAGER)
    @JsonProperty("group_grants")
    @JsonSerialize(using = MultiModelDeserializer.class)
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Grant> grants = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_groups",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("group_users")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<User> users = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "groups_organizations",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "organization_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
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
    // endregion

    public String getId() {
        return id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public List<Grant> getGrants() {
        return grants;
    }

    public void setGrants(List<Grant> grants) {
        this.grants = grants;
    }

    public boolean isDefaultUserAssignation() {
        return defaultUserAssignation;
    }

    public void setDefaultUserAssignation(boolean defaultUserAssignation) {
        this.defaultUserAssignation = defaultUserAssignation;
    }

    public List<Organization> getOrganizations() {
        return organizations;
    }

    public void setOrganizations(List<Organization> organizations) {
        this.organizations = organizations;
    }

    public List<Grant.GRANT_TYPE> getExercisesDefaultGrants() {
        return exercisesDefaultGrants;
    }

    public void setExercisesDefaultGrants(List<Grant.GRANT_TYPE> defaultExerciseAssignations) {
        this.exercisesDefaultGrants = defaultExerciseAssignations;
    }

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
