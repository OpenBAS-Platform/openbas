package io.openex.rest.user;

import io.openex.config.SessionManager;
import io.openex.database.model.Communication;
import io.openex.database.model.Inject;
import io.openex.database.model.User;
import io.openex.database.repository.*;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.player.CreatePlayerInput;
import io.openex.rest.user.form.player.UpdatePlayerInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.transaction.Transactional;
import javax.validation.Valid;

import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.helper.UserHelper.currentUser;

@RestController
public class PlayerApi extends RestBehavior {

    @Resource
    private SessionManager sessionManager;

    private CommunicationRepository communicationRepository;
    private OrganizationRepository organizationRepository;
    private InjectRepository injectRepository;
    private UserRepository userRepository;
    private TagRepository tagRepository;
    private UserService userService;

    @Autowired
    public void setCommunicationRepository(CommunicationRepository communicationRepository) {
        this.communicationRepository = communicationRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/players")
    @PreAuthorize("isObserver()")
    public Iterable<User> players() {
        Iterable<Inject> injects = injectRepository.findAll();
        return fromIterable(userRepository.findAll()).stream()
                .peek(user -> user.resolveInjects(injects)).toList();
    }

    @GetMapping("/api/player/{userId}/communications")
    @PreAuthorize("isPlanner()")
    public Iterable<Communication> playerCommunications(@PathVariable String userId) {
        return communicationRepository.findByUser(userId);
    }

    @Transactional(rollbackOn = Exception.class)
    @PostMapping("/api/players")
    @PreAuthorize("isPlanner()")
    public User createPlayer(@Valid @RequestBody CreatePlayerInput input) {
        User user = new User();
        user.setUpdateAttributes(input);
        user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        User savedUser = userRepository.save(user);
        userService.createUserToken(savedUser);
        return savedUser;
    }

    @PutMapping("/api/players/{userId}")
    @PreAuthorize("isPlanner()")
    public User updatePlayer(@PathVariable String userId, @Valid @RequestBody UpdatePlayerInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!currentUser().isAdmin() && user.isManager()) {
            throw new UnsupportedOperationException("You dont have the right to update this user");
        }
        user.setUpdateAttributes(input);
        user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        return userRepository.save(user);
    }

    @DeleteMapping("/api/players/{userId}")
    @PreAuthorize("isPlanner()")
    public void deletePlayer(@PathVariable String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!currentUser().isAdmin() && user.isManager()) {
            throw new UnsupportedOperationException("You dont have the right to delete this user");
        }
        sessionManager.invalidateUserSession(userId);
        userRepository.deleteById(userId);
    }
}
