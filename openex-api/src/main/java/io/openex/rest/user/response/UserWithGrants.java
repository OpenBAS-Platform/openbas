package io.openex.rest.user.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.User;
import org.springframework.beans.BeanUtils;

import java.util.Map;

public class UserWithGrants extends User {

    public static UserWithGrants from(User user, Map<String, BaseGrant> grants) {
        UserWithGrants userWithGrants = new UserWithGrants();
        BeanUtils.copyProperties(user, userWithGrants);
        userWithGrants.grants = grants;
        return userWithGrants;
    }

    @JsonProperty("user_grants")
    public Map<String, BaseGrant> grants;

    public Map<String, BaseGrant> getGrants() {
        return grants;
    }

    public void setGrants(Map<String, BaseGrant> grants) {
        this.grants = grants;
    }
}
