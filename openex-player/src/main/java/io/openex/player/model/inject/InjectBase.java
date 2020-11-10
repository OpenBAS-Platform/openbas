package io.openex.player.model.inject;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.player.model.audience.User;
import io.openex.player.utils.Executor;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class InjectBase {

    private List<User> users;
    private String contentHeader;
    private String contentFooter;

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    @JsonProperty("content_header")
    public String getContentHeader() {
        return contentHeader;
    }

    public void setContentHeader(String contentHeader) {
        this.contentHeader = contentHeader;
    }

    @JsonProperty("content_footer")
    public String getContentFooter() {
        return contentFooter;
    }

    public void setContentFooter(String contentFooter) {
        this.contentFooter = contentFooter;
    }

    public abstract Class<? extends Executor<?>> executor();
}
