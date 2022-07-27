package io.openex.database.model;

import java.time.Instant;
import java.util.Optional;

public interface Injection {
    String getId();

    Exercise getExercise();

    Optional<Instant> getDate();
}
