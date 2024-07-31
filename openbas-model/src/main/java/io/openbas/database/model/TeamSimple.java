package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.openbas.database.raw.RawTeam;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import static java.time.Instant.now;

@Setter
@Getter
public class TeamSimple {
    @JsonProperty("team_id")
    @NotBlank
    private String id;

    @NotBlank
    @JsonProperty("team_name")
    @Queryable(searchable = true)
    private String name;

    @JsonProperty("team_description")
    private String description;

    @JsonProperty("team_created_at")
    private Instant createdAt = now();

    @JsonProperty("team_updated_at")
    private Instant updatedAt = now();

    @JsonProperty("team_tags")
    private Set<String> tags = new HashSet<>();

    @JsonProperty("team_organization")
    private String organization;

    @JsonProperty("team_users")
    private Set<String> users = new HashSet<>();

    @JsonProperty("team_exercises")
    private Set<String> exercises = new HashSet<>();

    @JsonProperty("team_scenarios")
    private Set<String> scenarios = new HashSet<>();

    @JsonProperty("team_contextual")
    private Boolean contextual = false;

    @JsonProperty("team_exercises_users")
    private Set<ExerciseTeamUser> exerciseTeamUsers = new HashSet<>();

    @JsonProperty("team_users_number")
    public long getUsersNumber() {
        return this.users.size();
    }

    // region transient
    @JsonProperty("team_exercise_injects")
    private Set<String> exercisesInjects = new HashSet<>();

    @JsonProperty("team_exercise_injects_number")
    public long getExercisesInjectsNumber() {
        return this.exercisesInjects.size();
    }

    @JsonProperty("team_scenario_injects")
    Set<String> scenariosInjects = new HashSet<>();

    @JsonProperty("team_scenario_injects_number")
    public long getScenariosInjectsNumber() {
        return this.scenariosInjects.size();
    }

    @JsonIgnore
    private List<InjectExpectation> injectExpectations = new ArrayList<>();

    @JsonProperty("team_inject_expectations")
    private Set<String> getInjectExpectationsAsStringList() {
        return getInjectExpectations().stream().map(InjectExpectation::getId).collect(Collectors.toSet());
    }

    @JsonProperty("team_injects_expectations_number")
    public long getInjectExceptationsNumber() {
        return getInjectExpectations().size();
    }

    @JsonProperty("team_injects_expectations_total_score")
    @NotNull
    public double getInjectExceptationsTotalScore() {
        return getInjectExpectations().stream()
            .filter((inject) -> inject.getScore() != null)
            .mapToDouble(InjectExpectation::getScore).sum();
    }
    @JsonProperty("team_injects_expectations_total_score_by_exercise")
    @NotNull
    public Map<String, Double> getInjectExceptationsTotalScoreByExercise() {
        return getInjectExpectations().stream()
            .filter(expectation -> Objects.nonNull(expectation.getExercise()) && Objects.nonNull(expectation.getScore()))
            .collect(Collectors.groupingBy(expectation -> expectation.getExercise().getId(),
                Collectors.summingDouble(InjectExpectation::getScore)));
    }

    @JsonProperty("team_injects_expectations_total_expected_score")
    @NotNull
    public double getInjectExceptationsTotalExpectedScore() {
        return getInjectExpectations().stream().mapToDouble(InjectExpectation::getExpectedScore).sum();
    }

    @JsonProperty("team_injects_expectations_total_expected_score_by_exercise")
    @NotNull
    public Map<String, Double> getInjectExpectationsTotalExpectedScoreByExercise() {
        Map<String, Double> result = getInjectExpectations().stream()
                .filter(expectation -> Objects.nonNull(expectation.getExercise()))
                .collect(Collectors.groupingBy(expectation -> expectation.getExercise().getId(),
                        Collectors.summingDouble(InjectExpectation::getExpectedScore)));
        return result;
    }
    // endregion

    @JsonProperty("team_communications")
    List<Communication> communications = new ArrayList<>();

    public TeamSimple(RawTeam raw) {
        super();
        this.id = raw.getTeam_id();
        this.scenarios = raw.getTeam_scenarios();
        this.exercisesInjects = raw.getTeam_exercise_injects();
        this.contextual = raw.getTeam_contextual();
        this.exercises = raw.getTeam_exercises();
        this.createdAt = raw.getTeam_created_at();
        this.description = raw.getTeam_description();
        this.updatedAt = raw.getTeam_updated_at();
        this.name = raw.getTeam_name();
        this.organization = raw.getTeam_organization();
        this.users = raw.getTeam_users();
        this.tags = raw.getTeam_tags();
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
