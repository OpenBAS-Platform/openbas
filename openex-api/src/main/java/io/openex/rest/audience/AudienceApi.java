package io.openex.rest.audience;

import io.openex.database.model.Audience;
import io.openex.database.model.Exercise;
import io.openex.database.model.User;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import io.openex.database.specification.AudienceSpecification;
import io.openex.rest.audience.form.UpdateUsersAudienceInput;
import io.openex.rest.audience.form.CreateAudienceInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

import static io.openex.database.model.User.ROLE_PLANIFICATEUR;
import static io.openex.database.model.User.ROLE_USER;

@RestController
@RolesAllowed(ROLE_USER)
public class AudienceApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private AudienceRepository audienceRepository;
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @GetMapping("/api/exercises/{exerciseId}/audiences")
    public Iterable<Audience> getAudiences(@PathVariable String exerciseId) {
        return audienceRepository.findAll(AudienceSpecification.fromExercise(exerciseId));
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @PostMapping("/api/exercises/{exerciseId}/audiences")
    @PostAuthorize("hasRole('" + ROLE_PLANIFICATEUR + "') OR isExercisePlanner(#exerciseId)")
    public Audience createAudience(@PathVariable String exerciseId, @Valid @RequestBody CreateAudienceInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Audience audience = new Audience();
        audience.setUpdateAttributes(input);
        audience.setExercise(exercise);
        return audienceRepository.save(audience);
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @DeleteMapping("/api/exercises/{exerciseId}/audiences/{audienceId}")
    @PostAuthorize("hasRole('" + ROLE_PLANIFICATEUR + "') OR isExercisePlanner(#exerciseId)")
    public void deleteAudience(@PathVariable String audienceId) {
        audienceRepository.deleteById(audienceId);
    }

    @SuppressWarnings({"ELValidationInJSP", "SpringElInspection"})
    @PutMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/users")
    @PostAuthorize("hasRole('" + ROLE_PLANIFICATEUR + "') OR isExercisePlanner(#exerciseId)")
    public Audience updateAudienceUsers(@PathVariable String audienceId, @Valid @RequestBody UpdateUsersAudienceInput input) {
        Audience audience = audienceRepository.findById(audienceId).orElseThrow();
        Iterable<User> audienceUsers = userRepository.findAllById(input.getUserIds());
        audience.setUsers(fromIterable(audienceUsers));
        return audienceRepository.save(audience);
    }
}
