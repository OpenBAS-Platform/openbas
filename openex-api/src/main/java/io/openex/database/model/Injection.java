package io.openex.database.model;

import io.openex.execution.Executor;

import javax.persistence.Transient;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;

public abstract class Injection {
    public abstract String getId();

    public abstract Exercise getExercise();

    public abstract Optional<Instant> getDate();

    public abstract Class<? extends Executor<?>> executor();

    public abstract List<InjectDocument> getDocuments();

    @Transient
    public String getHeader() {
        return ofNullable(getExercise()).map(Exercise::getHeader).orElse("");
    }

    @Transient
    public String getFooter() {
        return ofNullable(getExercise()).map(Exercise::getFooter).orElse("");
    }
}
