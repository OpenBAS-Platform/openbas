package io.openex.rest.group.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class GroupUpdateUsersInput {

    @JsonProperty("group_users")
    private List<String> userIds;

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }
}
