package io.openex.player.rest.group;

import io.openex.player.model.database.Group;
import io.openex.player.repository.GroupRepository;
import io.openex.player.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;

import static io.openex.player.model.database.User.ROLE_USER;

@RestController
@RolesAllowed(ROLE_USER)
public class GroupApi extends RestBehavior {

    private GroupRepository groupRepository;

    @Autowired
    public void setGroupRepository(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @GetMapping("/api/groups")
    public Iterable<Group> groups() {
        return groupRepository.findAll();
    }
}
