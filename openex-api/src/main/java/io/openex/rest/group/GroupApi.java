package io.openex.rest.group;

import io.openex.database.audit.BaseEvent;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.rest.group.form.GroupCreateInput;
import io.openex.rest.group.form.GroupGrantInput;
import io.openex.rest.group.form.GroupUpdateUsersInput;
import io.openex.rest.group.form.OrganizationGrantInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import jakarta.validation.Valid;
import java.util.Spliterator;

import static io.openex.database.audit.ModelBaseListener.DATA_UPDATE;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static java.time.Instant.now;
import static java.util.stream.Collectors.toList;
import static java.util.stream.StreamSupport.stream;

@RestController
@RolesAllowed(ROLE_USER)
public class GroupApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private GrantRepository grantRepository;
    private OrganizationRepository organizationRepository;
    private GroupRepository groupRepository;
    private UserRepository userRepository;
    private ApplicationEventPublisher appPublisher;

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Autowired
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.appPublisher = applicationEventPublisher;
    }

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
        group.setExercisesDefaultGrants(input.defaultExerciseGrants());
        return groupRepository.save(group);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/groups/{groupId}/users")
    public Group updateGroupUsers(@PathVariable String groupId,
                                  @Valid @RequestBody GroupUpdateUsersInput input) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        Spliterator<User> userSpliterator = userRepository.findAllById(input.getUserIds()).spliterator();
        group.setUsers(stream(userSpliterator, false).collect(toList()));
        Group savedGroup = groupRepository.save(group);
        // Publish exercises impacted by this group change.
        savedGroup.getGrants().stream()
                .map(Grant::getExercise)
                .forEach(exercise -> appPublisher.publishEvent(new BaseEvent(DATA_UPDATE, exercise, mapper)));
        return savedGroup;
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/groups/{groupId}/information")
    public Group updateGroupInformation(@PathVariable String groupId,
                                        @Valid @RequestBody GroupCreateInput input) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        group.setUpdateAttributes(input);
        group.setExercisesDefaultGrants(input.defaultExerciseGrants());
        return groupRepository.save(group);
    }

    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/groups/{groupId}/grants")
    public Grant groupGrant(@PathVariable String groupId, @Valid @RequestBody GroupGrantInput input) {
        // Resolve dependencies
        Group group = groupRepository.findById(groupId).orElseThrow();
        Exercise exercise = exerciseRepository.findById(input.getExerciseId()).orElseThrow();
        exercise.setUpdatedAt(now());
        // Create the grant
        Grant grant = new Grant();
        grant.setName(input.getName());
        grant.setGroup(group);
        grant.setExercise(exercise);
        Grant savedGrant = grantRepository.save(grant);
        exercise.getGrants().add(savedGrant);
        exerciseRepository.save(exercise);
        return savedGrant;
    }

    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/groups/{groupId}/organizations")
    public Group groupOrganization(@PathVariable String groupId, @Valid @RequestBody OrganizationGrantInput input) {
        // Resolve dependencies
        Group group = groupRepository.findById(groupId).orElseThrow();
        Organization organization = organizationRepository.findById(input.getOrganizationId()).orElseThrow();
        group.getOrganizations().add(organization);
        return groupRepository.save(group);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/groups/{groupId}/organizations/{organizationId}")
    public Group deleteGroupOrganization(@PathVariable String groupId, @PathVariable String organizationId) {
        Group group = groupRepository.findById(groupId).orElseThrow();
        Organization organization = organizationRepository.findById(organizationId).orElseThrow();
        group.getOrganizations().remove(organization);
        return groupRepository.save(group);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/grants/{grantId}")
    public void deleteGrant(@PathVariable String grantId) {
        grantRepository.deleteById(grantId);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/groups/{groupId}")
    public void deleteGroup(@PathVariable String groupId) {
        groupRepository.deleteById(groupId);
    }
}
