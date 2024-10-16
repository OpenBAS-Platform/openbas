package io.openbas.database.raw;

import java.time.Instant;
import java.util.List;

public interface RawExerciseSimple {

    String getExercise_id();

    String getExercise_status();

    Instant getExercise_start_date();

    Instant getExercise_updated_at();

    Instant getExercise_end_date();

    String getExercise_name();

    String getExercise_category();

    String getExercise_subtitle();

    List<String> getExercise_tags();

    List<String> getInject_ids();
}
