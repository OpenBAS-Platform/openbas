package io.openbas.database.raw;

import java.time.Instant;
import java.util.Set;

public interface RawFinishedExerciseWithInjects {
  String getExercise_id();

  Instant getExercise_end_date();

  Set<String> getInject_ids();
}
