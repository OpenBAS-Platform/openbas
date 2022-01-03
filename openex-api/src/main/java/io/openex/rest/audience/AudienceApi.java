package io.openex.rest.audience;

import io.openex.database.model.Audience;
import io.openex.database.model.Exercise;
import io.openex.database.model.User;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.UserRepository;
import io.openex.database.specification.AudienceSpecification;
import io.openex.rest.audience.form.AudienceUpdateActivationInput;
import io.openex.rest.audience.form.CreateAudienceInput;
import io.openex.rest.audience.form.UpdateUsersAudienceInput;
import io.openex.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;

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
    @PostAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Audience> getAudiences(@PathVariable String exerciseId) {
        return audienceRepository.findAll(AudienceSpecification.fromExercise(exerciseId));
    }

    @GetMapping("/api/exercises/{exerciseId}/audiences/{audienceId}")
    @PostAuthorize("isExerciseObserver(#exerciseId)")
    public Audience getAudience(@PathVariable String audienceId) {
        return audienceRepository.findById(audienceId).orElseThrow();
    }

    @GetMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/players")
    @PostAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<User> getAudiencePlayers(@PathVariable String audienceId) {
        return audienceRepository.findById(audienceId).orElseThrow().getUsers();
    }

    @PostMapping("/api/exercises/{exerciseId}/audiences")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Audience createAudience(@PathVariable String exerciseId,
                                   @Valid @RequestBody CreateAudienceInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Audience audience = new Audience();
        audience.setUpdateAttributes(input);
        audience.setExercise(exercise);
        return audienceRepository.save(audience);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/audiences/{audienceId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteAudience(@PathVariable String audienceId) {
        audienceRepository.deleteById(audienceId);
    }

    @PutMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/players")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Audience updateAudienceUsers(@PathVariable String audienceId,
                                        @Valid @RequestBody UpdateUsersAudienceInput input) {
        Audience audience = audienceRepository.findById(audienceId).orElseThrow();
        Iterable<User> audienceUsers = userRepository.findAllById(input.getUserIds());
        audience.setUsers(fromIterable(audienceUsers));
        return audienceRepository.save(audience);
    }

    @PutMapping("/api/exercises/{exerciseId}/audiences/{audienceId}/activation")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Audience updateAudienceActivation(@PathVariable String audienceId,
                                             @Valid @RequestBody AudienceUpdateActivationInput input) {
        Audience audience = audienceRepository.findById(audienceId).orElseThrow();
        audience.setEnabled(input.isEnabled());
        return audienceRepository.save(audience);
    }
}
