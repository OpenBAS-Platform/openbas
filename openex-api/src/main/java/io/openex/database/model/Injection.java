package io.openex.database.model;

import io.openex.model.Executor;

import javax.persistence.Transient;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;

public abstract class Injection<T> {
    public abstract String getId();

    public abstract Exercise getExercise();

    public abstract Optional<Instant> getDate();

    public abstract T getContent();

    public abstract void setContent(T content);

    public abstract Class<? extends Executor<T>> executor();

    public abstract String getType();

    public abstract List<Audience> getAudiences();

    @Transient
    public String getHeader() {
        return ofNullable(getExercise()).map(Exercise::getHeader).orElse("");
    }

    @Transient
    public String getFooter() {
        return ofNullable(getExercise()).map(Exercise::getFooter).orElse("");
    }

    @Transient
    public abstract boolean isGlobalInject();
}
