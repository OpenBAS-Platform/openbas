package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openex.database.audit.ModelBaseListener;
import io.openex.helper.MonoIdDeserializer;
import io.openex.helper.MultiIdDeserializer;
import io.openex.helper.MultiModelDeserializer;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Predicate;

import static java.time.Instant.now;

@Entity
@Table(name = "teams")
@EntityListeners(ModelBaseListener.class)
public class Team implements Base {
    @Id
    @Column(name = "team_id")
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", type = org.hibernate.id.uuid.UuidGenerator.class)
    @JsonProperty("team_id")
    private String id;

    @Setter
    @Column(name = "team_name")
    @NotBlank
    @JsonProperty("team_name")
    private String name;

    @Setter
    @Column(name = "team_description")
    @JsonProperty("team_description")
    private String description;

    @Setter
    @Column(name = "team_created_at")
    @JsonProperty("team_created_at")
    private Instant createdAt = now();

    @Setter
    @Column(name = "team_updated_at")
    @JsonProperty("team_updated_at")
    private Instant updatedAt = now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "teams_tags",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("team_tags")
    private List<Tag> tags = new ArrayList<>();

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_organization")
    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("team_organization")
    private Organization organization;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "users_teams",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("team_users")
    private List<User> users = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "exercises_teams",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "exercise_id"))
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("team_exercises")
    private List<Exercise> exercises = new ArrayList<>();

    @Setter
    @Column(name = "team_contextual")
    @JsonProperty("team_contextual")
    private Boolean contextual = false;

    @Getter
    @Setter
    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("team_exercises_users")
    @JsonSerialize(using = MultiModelDeserializer.class)
    private List<ExerciseTeamUser> exerciseTeamUsers = new ArrayList<>();

    @JsonProperty("team_users_number")
    public long getUsersNumber() {
        return getUsers().size();
    }

    // region transient
    @JsonProperty("team_injects")
    @JsonSerialize(using = MultiIdDeserializer.class)
    public List<Inject> getInjects() {
        Predicate<Inject> selectedInject = inject -> inject.isAllTeams() || inject.getTeams().contains(this);
        return getExercises().stream().map(exercise -> exercise.getInjects().stream().filter(selectedInject).distinct().toList()).flatMap(List::stream).toList();
    }

    @JsonProperty("team_injects_number")
    public long getInjectsNumber() {
        return getInjects().size();
    }

    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
    @JsonSerialize(using = MultiIdDeserializer.class)
    @JsonProperty("team_inject_expectations")
    private List<InjectExpectation> injectExpectations = new ArrayList<>();

    @JsonProperty("team_injects_expectations_number")
    public long getInjectExceptationsNumber() {
        return getInjectExpectations().size();
    }

    @JsonProperty("team_injects_expectations_total_score")
    public long getInjectExceptationsTotalScore() {
        return getInjectExpectations().stream().mapToLong(InjectExpectation::getScore).sum();
    }

    @JsonProperty("team_injects_expectations_total_expected_score")
    public long getInjectExceptationsTotalExpectedScore() {
        return getInjectExpectations().stream().mapToLong(InjectExpectation::getExpectedScore).sum();
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getContextual() {
        return contextual;
    }

    public void setContextual(Boolean contextual) {
        this.contextual = contextual;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public List<Exercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises;
    }

    public List<ExerciseTeamUser> getExerciseTeamUsers() {
        return exerciseTeamUsers;
    }

    public void setExerciseTeamUsers(List<ExerciseTeamUser> exerciseTeamUsers) {
        this.exerciseTeamUsers = exerciseTeamUsers;
    }

    public List<InjectExpectation> getInjectExpectations() {
        return injectExpectations;
    }

    public void setInjectExpectations(List<InjectExpectation> injectExpectations) {
        this.injectExpectations = injectExpectations;
    }

    @JsonProperty("team_communications")
    public List<Communication> getCommunications() {
        return getInjects().stream().flatMap(inject -> inject.getCommunications().stream())
                .distinct()
                .toList();
    }

    public long getUsersNumberInExercise(Exercise exercise) {
        return getExerciseTeamUsers().stream().filter(exerciseTeamUser -> exerciseTeamUser.getExercise().getId().equals(exercise.getId())).toList().size();
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
