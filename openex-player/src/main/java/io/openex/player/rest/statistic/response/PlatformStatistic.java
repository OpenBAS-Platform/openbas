package io.openex.player.rest.statistic.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlatformStatistic {

    @JsonProperty("platform_id")
    private String platformId = "openex";

    @JsonProperty("exercises_count")
    private long exercisesCount;

    @JsonProperty("users_count")
    private long usersCount;

    @JsonProperty("injects_count")
    private long injectsCount;

    public PlatformStatistic() {
    }

    public PlatformStatistic(long exercisesCount, long usersCount, long injectsCount) {
        this.exercisesCount = exercisesCount;
        this.usersCount = usersCount;
        this.injectsCount = injectsCount;
    }

    public String getPlatformId() {
        return platformId;
    }

    public void setPlatformId(String platformId) {
        this.platformId = platformId;
    }

    public long getExercisesCount() {
        return exercisesCount;
    }

    public void setExercisesCount(long exercisesCount) {
        this.exercisesCount = exercisesCount;
    }

    public long getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(long usersCount) {
        this.usersCount = usersCount;
    }

    public long getInjectsCount() {
        return injectsCount;
    }

    public void setInjectsCount(long injectsCount) {
        this.injectsCount = injectsCount;
    }
}
