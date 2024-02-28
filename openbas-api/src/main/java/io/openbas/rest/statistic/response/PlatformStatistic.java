package io.openbas.rest.statistic.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlatformStatistic {

    @JsonProperty("platform_id")
    private String platformId = "openbas";

    @JsonProperty("exercises_count")
    private StatisticElement exercisesCount;

    @JsonProperty("users_count")
    private StatisticElement usersCount;

    @JsonProperty("injects_count")
    private StatisticElement injectsCount;

    public PlatformStatistic() {
        // Default constructor
    }

    public String getPlatformId() {
        return platformId;
    }

    public void setPlatformId(String platformId) {
        this.platformId = platformId;
    }

    public StatisticElement getExercisesCount() {
        return exercisesCount;
    }

    public void setExercisesCount(StatisticElement exercisesCount) {
        this.exercisesCount = exercisesCount;
    }

    public StatisticElement getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(StatisticElement usersCount) {
        this.usersCount = usersCount;
    }

    public StatisticElement getInjectsCount() {
        return injectsCount;
    }

    public void setInjectsCount(StatisticElement injectsCount) {
        this.injectsCount = injectsCount;
    }
}
