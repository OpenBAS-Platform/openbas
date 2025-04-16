package io.openbas.notification.handler;

import io.openbas.database.model.Exercise;
import io.openbas.notification.model.NotificationEvent;
import io.openbas.notification.model.NotificationEventType;
import io.openbas.rest.exercise.form.ExercisesGlobalScoresInput;
import io.openbas.rest.exercise.response.ExercisesGlobalScoresOutput;
import io.openbas.rest.exercise.service.ExerciseService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ScenarioNotificationEventHandler implements NotificationEventHandler {

  @Autowired private ExerciseService exerciseService;

  @Override
  public void handle(NotificationEvent event) {
    if (NotificationEventType.SIMULATION_COMPLETED.equals(event.getEventType())) {
      // get the last 2 simulations
      Exercise lastSimulation =
          exerciseService.previousFinishedSimulation(event.getResourceId(), event.getTimestamp());
      if (lastSimulation == null || lastSimulation.getEnd().isEmpty()) {
        return;
      }
      Exercise secondLastSimulation =
          exerciseService.previousFinishedSimulation(
              event.getResourceId(), lastSimulation.getEnd().get());
      if (secondLastSimulation == null) {
        return;
      }

      // calculate if there is a score degradation
      ExercisesGlobalScoresInput exercisesGlobalScoresInput =
          new ExercisesGlobalScoresInput(
              List.of(lastSimulation.getId(), secondLastSimulation.getId()));
      ExercisesGlobalScoresOutput exercisesGlobalScoresOutput =
          exerciseService.getExercisesGlobalScores(exercisesGlobalScoresInput);
      if (exerciseService.isThereAScoreDegradation(
          exercisesGlobalScoresOutput.globalScoresByExerciseIds().get(lastSimulation.getId()),
          exercisesGlobalScoresOutput
              .globalScoresByExerciseIds()
              .get(secondLastSimulation.getId()))) {

        // TODO find and activate notification rule
      }
    }
  }
}
