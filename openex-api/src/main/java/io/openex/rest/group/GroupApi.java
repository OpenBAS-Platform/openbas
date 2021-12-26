package io.openex.rest.group;

import io.openex.database.model.Group;
import io.openex.database.model.User;
import io.openex.database.repository.GroupRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.group.form.GroupUpdateInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Spliterator;
import java.util.stream.Collectors;

import static io.openex.database.model.User.ROLE_PLANER;
import static io.openex.database.model.User.ROLE_USER;
import static java.util.stream.StreamSupport.stream;

@RestController
@RolesAllowed(ROLE_USER)
public class GroupApi extends RestBehavior {

    private GroupRepository groupRepository;
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setGroupRepository(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @GetMapping("/api/groups")
    public Iterable<Group> groups() {
        return groupRepository.findAll();
    }

    @RolesAllowed(ROLE_PLANER)
    @PutMapping("/api/groups/{groupId}")
    public Group updateExercise(@PathVariable String groupId, @Valid @RequestBody GroupUpdateInput groupInput) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        Spliterator<User> userSpliterator = userRepository.findAllById(groupInput.getUserIds()).spliterator();
        group.setUsers(stream(userSpliterator, false).collect(Collectors.toList()));
        return groupRepository.save(group);
    }
}
