package io.openex.rest.user;

import io.openex.config.AppConfig;
import io.openex.database.model.User;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.player.CreatePlayerInput;
import io.openex.rest.user.form.player.UpdatePlayerInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.helper.DatabaseHelper.updateRelation;

@RestController
public class PlayerApi extends RestBehavior {

    private OrganizationRepository organizationRepository;
    private UserRepository userRepository;
    private TagRepository tagRepository;
    private UserService userService;

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
    @PostAuthorize("isObserver()")
    public Iterable<User> players() {
        return userRepository.findAll();
    }

    @Transactional
    @PostMapping("/api/players")
    @PostAuthorize("isPlanner()")
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
    @PostAuthorize("isPlanner()")
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
    @PostAuthorize("isPlanner()")
    public void deletePlayer(@PathVariable String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (!currentUser().isAdmin() && user.isManager()) {
            throw new UnsupportedOperationException("You dont have the right to delete this user");
        }
        userRepository.deleteById(userId);
    }
}
