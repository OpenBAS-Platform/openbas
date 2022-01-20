package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class DryrunCreateInput {

    @JsonProperty("dryrun_users")
    private List<String> userIds = new ArrayList<>();

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }
}
