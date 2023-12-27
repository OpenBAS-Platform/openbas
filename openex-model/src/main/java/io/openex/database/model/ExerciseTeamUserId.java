package io.openex.database.model;

import javax.persistence.Embeddable;
import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ExerciseTeamUserId implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String exerciseId;
    private String teamId;
    private String userId;

    public ExerciseTeamUserId() {
        // Default constructor
    }

    public String getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }

    public String getTeamId() {
        return teamId;
    }

    public void setTeamId(String teamId) {
        this.teamId = teamId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ExerciseTeamUserId that = (ExerciseTeamUserId) o;
        return exerciseId.equals(that.exerciseId) && teamId.equals(that.teamId) && userId.equals(that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(exerciseId, teamId, userId);
    }
}
