package io.openex.database.model;

import io.openex.model.Execution;
import io.openex.model.Executor;

import javax.persistence.Transient;
import java.util.Date;
import java.util.List;

import static java.util.Optional.ofNullable;

public abstract class Injection<T> {
    public abstract String getId();

    public abstract Exercise getExercise();

    public abstract Date getDate();

    public abstract T getContent();

    public abstract Class<? extends Executor<T>> executor();

    @Transient
    public String getHeader() {
        return ofNullable(getExercise()).map(Exercise::getHeader).orElse("");
    }

    @Transient
    public String getFooter() {
        return ofNullable(getExercise()).map(Exercise::getFooter).orElse("");
    }

    public abstract String getType();

    public abstract List<Audience> getAudiences();

    @Transient
    public abstract boolean isGlobalInject();

    @Transient
    public abstract void report(Execution execution);
}
