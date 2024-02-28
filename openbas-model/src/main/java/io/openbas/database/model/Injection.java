package io.openbas.database.model;

import io.openbas.database.model.Exercise;

import java.time.Instant;
import java.util.Optional;

public interface Injection {
    String getId();

    Exercise getExercise();

    Optional<Instant> getDate();
}
