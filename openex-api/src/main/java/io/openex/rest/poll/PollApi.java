package io.openex.rest.poll;

import io.openex.database.model.Answer;
import io.openex.database.model.Exercise;
import io.openex.database.model.Poll;
import io.openex.database.repository.AnswerRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.PollRepository;
import io.openex.database.specification.PollSpecification;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.poll.form.AnswerInput;
import io.openex.rest.poll.form.PollInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

import static io.openex.helper.DatabaseHelper.resolveOptionalRelation;

@RestController
public class PollApi extends RestBehavior {

    private PollRepository pollRepository;
    private AnswerRepository answerRepository;
    private ExerciseRepository exerciseRepository;

    @Autowired
    public void setAnswerRepository(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    @Autowired
    public void setPollRepository(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    // region polls
    @GetMapping("/api/exercises/{exerciseId}/polls")
    public Iterable<Poll> getExercisePolls(@PathVariable String exerciseId) {
        return pollRepository.findAll(PollSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/polls")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Poll createPoll(@PathVariable String exerciseId,
                           @Valid @RequestBody PollInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Poll poll = new Poll();
        poll.setUpdateAttributes(input);
        poll.setExercise(exercise);
        return pollRepository.save(poll);
    }

    @PutMapping("/api/exercises/{exerciseId}/polls/{pollId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Poll updatePoll(@PathVariable String exerciseId,
                           @PathVariable String pollId,
                           @Valid @RequestBody PollInput input) {
        Poll poll = pollRepository.findById(pollId).orElseThrow();
        poll.setUpdateAttributes(input);
        return pollRepository.save(poll);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/polls/{pollId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deletePoll(@PathVariable String exerciseId, @PathVariable String pollId) {
        pollRepository.deleteById(pollId);
    }
    // endregion

    // region answers
    @PostMapping("/api/exercises/{exerciseId}/polls/{pollId}/answers")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Answer createAnswer(@PathVariable String exerciseId,
                               @PathVariable String pollId,
                               @Valid @RequestBody AnswerInput input) {
        Answer answer = new Answer();
        answer.setUpdateAttributes(input);
        answer.setPoll(resolveOptionalRelation(pollId, pollRepository));
        return answerRepository.save(answer);
    }

    @PutMapping("/api/exercises/{exerciseId}/polls/{pollId}/answers/{answerId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Answer updatePoll(@PathVariable String exerciseId,
                             @PathVariable String answerId,
                             @Valid @RequestBody AnswerInput input) {
        Answer answer = answerRepository.findById(answerId).orElseThrow();
        answer.setUpdateAttributes(input);
        return answerRepository.save(answer);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/polls/{pollId}/answers/{answerId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteAnswer(@PathVariable String exerciseId, @PathVariable String answerId) {
        answerRepository.deleteById(answerId);
    }
    // endregion
}
