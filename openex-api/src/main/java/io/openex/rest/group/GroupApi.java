package io.openex.rest.group;

import io.openex.database.model.*;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.GrantRepository;
import io.openex.database.repository.GroupRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.group.form.GroupCreateInput;
import io.openex.rest.group.form.GroupGrantInput;
import io.openex.rest.group.form.GroupUpdateUsersInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Spliterator;
import java.util.stream.Collectors;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

@RestController
@RolesAllowed(ROLE_USER)
public class GroupApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private GrantRepository grantRepository;
    private GroupRepository groupRepository;
    private UserRepository userRepository;

    @Autowired
    public void setGrantRepository(GrantRepository grantRepository) {
        this.grantRepository = grantRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

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

    @GetMapping("/api/groups/{groupId}")
    public Group group(@PathVariable String groupId) {
        return groupRepository.findById(groupId).orElseThrow();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/groups")
    public Group createGroup(@Valid @RequestBody GroupCreateInput input) {
        Group group = new Group();
        group.setUpdateAttributes(input);
        return groupRepository.save(group);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/groups/{groupId}/users")
    public Group updateGroupUsers(@PathVariable String groupId,
                                @Valid @RequestBody GroupUpdateUsersInput input) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        Spliterator<User> userSpliterator = userRepository.findAllById(input.getUserIds()).spliterator();
        group.setUsers(stream(userSpliterator, false).collect(toList()));
        return groupRepository.save(group);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/groups/{groupId}/information")
    public Group updateGroupInformation(@PathVariable String groupId,
                                  @Valid @RequestBody GroupCreateInput input) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        group.setUpdateAttributes(input);
        return groupRepository.save(group);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/groups/{groupId}/grants")
    public Grant groupGrant(@PathVariable String groupId, @Valid @RequestBody GroupGrantInput input) {
        // Resolve dependencies
        Group group = groupRepository.findById(groupId).orElseThrow();
        Exercise exercise = exerciseRepository.findById(input.getExerciseId()).orElseThrow();
        // Create the grant
        Grant grant = new Grant();
        grant.setName(input.getName());
        grant.setGroup(group);
        grant.setExercise(exercise);
        return grantRepository.save(grant);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/grants/{grantId}")
    public void deleteTag(@PathVariable String grantId) {
        grantRepository.deleteById(grantId);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/groups/{groupId}")
    public void deleteGroup(@PathVariable String groupId) {
        groupRepository.deleteById(groupId);
    }
}
