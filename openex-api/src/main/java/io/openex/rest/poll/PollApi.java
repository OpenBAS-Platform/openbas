package io.openex.rest.poll;

import io.openex.database.model.Answer;
import io.openex.database.model.Exercise;
import io.openex.database.model.Poll;
import io.openex.database.repository.AnswerRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.PollRepository;
import io.openex.database.specification.PollSpecification;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.poll.form.AnswerCreateInput;
import io.openex.rest.poll.form.PollCreateInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

import static io.openex.helper.DatabaseHelper.resolveRelation;

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
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Poll createPoll(@PathVariable String exerciseId,
                           @Valid @RequestBody PollCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        Poll poll = new Poll();
        poll.setUpdateAttributes(input);
        poll.setExercise(exercise);
        return pollRepository.save(poll);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/polls/{pollId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deletePoll(@PathVariable String pollId) {
        pollRepository.deleteById(pollId);
    }
    // endregion

    // region answers
    @PostMapping("/api/exercises/{exerciseId}/answers")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Answer createAnswer(@Valid @RequestBody AnswerCreateInput input) {
        Answer answer = new Answer();
        answer.setUpdateAttributes(input);
        answer.setPoll(resolveRelation(input.getPollId(), pollRepository));
        return answerRepository.save(answer);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/answers/{answerId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteAnswer(@PathVariable String answerId) {
        answerRepository.deleteById(answerId);
    }
    // endregion
}
