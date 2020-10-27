package io.openex.player.model.inject;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.player.model.audience.User;
import io.openex.player.utils.Executor;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class InjectBase {

    private List<User> users;

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public abstract Class<? extends Executor<?>> executor();
}
