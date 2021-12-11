package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DryRunCreateInput {

    @JsonProperty("dryrun_speed")
    private int speed;

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }
}
