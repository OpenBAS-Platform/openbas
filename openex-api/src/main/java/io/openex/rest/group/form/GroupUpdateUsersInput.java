package io.openex.rest.group.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class GroupUpdateUsersInput {

    @JsonProperty("group_users")
    private List<String> userIds;

}
