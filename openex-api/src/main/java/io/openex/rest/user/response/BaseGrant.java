package io.openex.rest.user.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class BaseGrant {

    @JsonIgnore
    private String baseId;

    @JsonProperty("user_can_update")
    public boolean userCanUpdate;

    @JsonProperty("user_can_delete")
    public boolean userCanDelete;

    public BaseGrant(String baseId, boolean userCanUpdate, boolean userCanDelete) {
        this.baseId = baseId;
        this.userCanUpdate = userCanUpdate;
        this.userCanDelete = userCanDelete;
    }

    public String getBaseId() {
        return baseId;
    }

    public void setBaseId(String baseId) {
        this.baseId = baseId;
    }

    public boolean isUserCanUpdate() {
        return userCanUpdate;
    }

    public void setUserCanUpdate(boolean userCanUpdate) {
        this.userCanUpdate = userCanUpdate;
    }

    public boolean isUserCanDelete() {
        return userCanDelete;
    }

    public void setUserCanDelete(boolean userCanDelete) {
        this.userCanDelete = userCanDelete;
    }
}
