package io.openbas.rest.user;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.config.SessionManager;
import io.openbas.database.model.*;
import io.openbas.database.raw.RawPlayer;
import io.openbas.database.repository.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.user.form.player.PlayerInput;
import io.openbas.service.UserService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.stream.Stream;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.specification.UserSpecification.accessibleFromOrganizations;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

@RestController
public class PlayerApi extends RestBehavior {

  @Resource
  private SessionManager sessionManager;

  private CommunicationRepository communicationRepository;
  private OrganizationRepository organizationRepository;
  private UserRepository userRepository;
  private TagRepository tagRepository;
  private UserService userService;
  private final TeamRepository teamRepository;

  public PlayerApi(TeamRepository teamRepository) {
    this.teamRepository = teamRepository;
  }

  @Autowired
  public void setCommunicationRepository(CommunicationRepository communicationRepository) {
    this.communicationRepository = communicationRepository;
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
  @Transactional(rollbackOn = Exception.class)
  @PreAuthorize("isObserver()")
  public Iterable<RawPlayer> players() {
    List<RawPlayer> players;
    OpenBASPrincipal currentUser = currentUser();
    if (currentUser.isAdmin()) {
      players = fromIterable(userRepository.rawAllPlayers());
    } else {
      User local = userRepository.findById(currentUser.getId()).orElseThrow(ElementNotFoundException::new);
      List<String> organizationIds = local.getGroups().stream()
          .flatMap(group -> group.getOrganizations().stream())
          .map(Organization::getId)
          .toList();
      players = userRepository.rawPlayersAccessibleFromOrganizations(organizationIds);
    }
    return players;
  }

  @PostMapping("/api/players/search")
  public Page<User> players(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    BiFunction<Specification<User>, Pageable, Page<User>> playersFunction;
    OpenBASPrincipal currentUser = currentUser();
    if (currentUser.isAdmin()) {
      playersFunction = (Specification<User> specification, Pageable pageable) -> this.userRepository
          .findAll(specification, pageable);
    } else {
      User local = userRepository.findById(currentUser.getId()).orElseThrow(ElementNotFoundException::new);
      List<String> organizationIds = local.getGroups().stream()
          .flatMap(group -> group.getOrganizations().stream())
          .map(Organization::getId)
          .toList();
      playersFunction = (Specification<User> specification, Pageable pageable) -> this.userRepository
          .findAll(accessibleFromOrganizations(organizationIds).and(specification), pageable);
    }
    return buildPaginationJPA(
        playersFunction,
        searchPaginationInput,
        User.class
    );
  }

  @GetMapping("/api/player/{userId}/communications")
  @PreAuthorize("isPlanner()")
  public Iterable<Communication> playerCommunications(@PathVariable String userId) {
    checkUserAccess(userRepository, userId);
    return communicationRepository.findByUser(userId);
  }

  @Transactional(rollbackOn = Exception.class)
  @PostMapping("/api/players")
  @PreAuthorize("isPlanner()")
  public User createPlayer(@Valid @RequestBody PlayerInput input) {
    checkOrganizationAccess(userRepository, input.getOrganizationId());
    User user = new User();
    user.setUpdateAttributes(input);
    user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
    User savedUser = userRepository.save(user);
    userService.createUserToken(savedUser);
    return savedUser;
  }

  @Transactional(rollbackOn = Exception.class)
  @PostMapping("/api/players/upsert")
  @PreAuthorize("isPlanner()")
  public User upsertPlayer(@Valid @RequestBody PlayerInput input) {
    checkOrganizationAccess(userRepository, input.getOrganizationId());
    Optional<User> user = userRepository.findByEmailIgnoreCase(input.getEmail());
    if (user.isPresent()) {
      User existingUser = user.get();
      existingUser.setUpdateAttributes(input);
      existingUser.setUpdatedAt(now());
      Iterable<String> tags = Stream.concat(existingUser.getTags().stream().map(Tag::getId).toList().stream(),
          input.getTagIds().stream()).distinct().toList();
      existingUser.setTags(fromIterable(tagRepository.findAllById(tags)));
      Iterable<String> teams = Stream.concat(existingUser.getTeams().stream().map(Team::getId).toList().stream(),
          input.getTeamIds().stream()).distinct().toList();
      existingUser.setTeams(fromIterable(teamRepository.findAllById(teams)));
      if (StringUtils.hasText(input.getOrganizationId())) {
        existingUser.setOrganization(
            updateRelation(input.getOrganizationId(), existingUser.getOrganization(), organizationRepository));
      }
      return userRepository.save(existingUser);
    } else {
      User newUser = new User();
      newUser.setUpdateAttributes(input);
      newUser.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
      newUser.setOrganization(
          updateRelation(input.getOrganizationId(), newUser.getOrganization(), organizationRepository));
      newUser.setTeams(fromIterable(teamRepository.findAllById(input.getTeamIds())));
      User savedUser = userRepository.save(newUser);
      userService.createUserToken(savedUser);
      return savedUser;
    }
  }

  @PutMapping("/api/players/{userId}")
  @PreAuthorize("isPlanner()")
  public User updatePlayer(@PathVariable String userId, @Valid @RequestBody PlayerInput input) {
    checkUserAccess(userRepository, userId);
    User user = userRepository.findById(userId).orElseThrow(ElementNotFoundException::new);
    if (!currentUser().isAdmin() && user.isManager() && !currentUser().getId().equals(userId)) {
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
    checkUserAccess(userRepository, userId);
    User user = userRepository.findById(userId).orElseThrow(ElementNotFoundException::new);
    if (!currentUser().isAdmin() && user.isManager()) {
      throw new UnsupportedOperationException("You dont have the right to delete this user");
    }
    sessionManager.invalidateUserSession(userId);
    userRepository.deleteById(userId);
  }
}
