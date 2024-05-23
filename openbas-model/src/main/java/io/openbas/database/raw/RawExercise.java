package io.openbas.database.raw;

import java.time.Instant;
import java.util.List;

public interface RawExercise {
    String getExercise_category();

    String getExercise_id();

    String getExercise_status();

    Instant getExercise_start_date();

    String getExercise_name();

    String getExercise_subtitle();

    List<String> getExercise_tags();

    List<String> getInject_ids();

    String getInject_expectation_type();

    Integer getInject_expectation_score();

}
