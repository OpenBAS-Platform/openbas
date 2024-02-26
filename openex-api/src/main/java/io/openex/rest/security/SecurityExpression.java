package io.openex.rest.security;

import io.openex.config.OpenexPrincipal;
import io.openex.database.model.Exercise;
import io.openex.database.model.Scenario;
import io.openex.database.model.User;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import io.openex.service.ScenarioService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.access.expression.SecurityExpressionRoot;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Optional;

import static io.openex.database.model.User.ROLE_ADMIN;

public class SecurityExpression extends SecurityExpressionRoot implements MethodSecurityExpressionOperations {

  private final UserRepository userRepository;
  private final ExerciseRepository exerciseRepository;
  private final ScenarioService scenarioService;

  private Object filterObject;
  private Object returnObject;

  // region utils
  public SecurityExpression(
      Authentication authentication,
      final UserRepository userRepository,
      final ExerciseRepository exerciseRepository,
      final ScenarioService scenarioService) {
    super(authentication);
    this.exerciseRepository = exerciseRepository;
    this.userRepository = userRepository;
    this.scenarioService = scenarioService;
  }

  private OpenexPrincipal getUser() {
    return (OpenexPrincipal) this.getPrincipal();
  }

  private boolean isUserHasBypass() {
    OpenexPrincipal principal = getUser();
    return principal.getAuthorities().stream().map(GrantedAuthority::getAuthority)
        .anyMatch(s -> s.equals(ROLE_ADMIN));
  }
  // endregion

  // region exercise annotations
  @SuppressWarnings("unused")
  public boolean isExercisePlanner(String exerciseId) {
    if (isUserHasBypass()) {
      return true;
    }
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    List<User> planners = exercise.getPlanners();
    Optional<User> planner = planners.stream()
        .filter(user -> user.getId().equals(getUser().getId())).findAny();
    return planner.isPresent();
  }

  @SuppressWarnings("unused")
  public boolean isExerciseObserver(String exerciseId) {
    if (isUserHasBypass()) {
      return true;
    }
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    List<User> observers = exercise.getObservers();
    Optional<User> observer = observers.stream()
        .filter(user -> user.getId().equals(getUser().getId())).findAny();
    return observer.isPresent();
  }

  public boolean isExercisePlayer(String exerciseId) {
    if (isUserHasBypass()) {
      return true;
    }
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    List<User> players = exercise.getUsers();
    Optional<User> player = players.stream()
        .filter(user -> user.getId().equals(getUser().getId())).findAny();
    return player.isPresent();
  }

  // All read only or playable access
  public boolean isExerciseObserverOrPlayer(String exerciseId) {
    return isExerciseObserver(exerciseId) || isExercisePlayer(exerciseId);
  }
  // endregion

  // region scenario annotations
  @SuppressWarnings("unused")
  public boolean isScenarioPlanner(@NotBlank final String scenarioId) {
    if (isUserHasBypass()) {
      return true;
    }
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    List<User> planners = scenario.getPlanners();
    Optional<User> planner = planners.stream()
        .filter(user -> user.getId().equals(getUser().getId())).findAny();
    return planner.isPresent();
  }

  @SuppressWarnings("unused")
  public boolean isScenarioObserver(@NotBlank final String scenarioId) {
    if (isUserHasBypass()) {
      return true;
    }
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    List<User> observers = scenario.getObservers();
    Optional<User> observer = observers.stream()
        .filter(user -> user.getId().equals(getUser().getId())).findAny();
    return observer.isPresent();
  }
  // endregion

  // region user annotations
  @SuppressWarnings("unused")
  public boolean isPlanner() {
    if (isUserHasBypass()) {
      return true;
    }
    User user = this.userRepository.findById(getUser().getId()).orElseThrow();
    return user.isPlanner();
  }

  @SuppressWarnings("unused")
  public boolean isObserver() {
    if (isUserHasBypass()) {
      return true;
    }
    User user = userRepository.findById(getUser().getId()).orElseThrow();
    return user.isObserver();
  }

  public boolean isPlayer() {
    User user = userRepository.findById(getUser().getId()).orElseThrow();
    return user.isPlayer();
  }
  // endregion

  // region setters
  @Override
  public Object getFilterObject() {
    return this.filterObject;
  }

  @Override
  public void setFilterObject(Object obj) {
    this.filterObject = obj;
  }

  @Override
  public Object getReturnObject() {
    return this.returnObject;
  }

  @Override
  public void setReturnObject(Object obj) {
    this.returnObject = obj;
  }

  @Override
  public Object getThis() {
    return this;
  }
  // endregion
}
