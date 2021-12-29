package io.openex.rest.security;

import io.openex.database.model.Exercise;
import io.openex.database.model.User;
import io.openex.database.repository.ExerciseRepository;
import org.springframework.security.access.expression.SecurityExpressionRoot;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Optional;

import static io.openex.database.model.User.ROLE_ADMIN;

public class ExerciseSecurityExpressionRoot extends SecurityExpressionRoot implements MethodSecurityExpressionOperations {

    private final ExerciseRepository exerciseRepository;
    private Object filterObject;
    private Object returnObject;

    public ExerciseSecurityExpressionRoot(Authentication authentication, ExerciseRepository exerciseRepository) {
        super(authentication);
        this.exerciseRepository = exerciseRepository;
    }

    @SuppressWarnings("unused")
    public boolean isExercisePlanner(String exerciseId) {
        User principal = (User) this.getPrincipal();
        boolean hasBypass = principal.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .anyMatch(s -> s.equals(ROLE_ADMIN));
        if (hasBypass) {
            return true;
        }
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<User> planners = exercise.getPlanners();
        Optional<User> planner = planners.stream()
                .filter(user -> user.getId().equals(principal.getId())).findAny();
        return planner.isPresent();
    }

    @SuppressWarnings("unused")
    public boolean isExerciseObserver(String exerciseId) {
        User principal = (User) this.getPrincipal();
        boolean hasBypass = principal.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .anyMatch(s -> s.equals(ROLE_ADMIN));
        if (hasBypass) {
            return true;
        }
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<User> planners = exercise.getObservers();
        Optional<User> planner = planners.stream()
                .filter(user -> user.getId().equals(principal.getId())).findAny();
        return planner.isPresent();
    }

    // region utils
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