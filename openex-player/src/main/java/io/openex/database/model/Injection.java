package io.openex.database.model;

import io.openex.model.Executor;

import javax.persistence.Transient;
import java.util.Date;
import java.util.List;

public interface Injection<T> {
    String getId();

    Exercise getExercise();

    Date getDate();

    T getContent();

    Class<? extends Executor<T>> executor();

    @Transient
    default String getHeader() {
        return getExercise().getHeader();
    }

    @Transient
    default String getFooter() {
        return getExercise().getFooter();
    }

    String getType();

    List<Audience> getAudiences();

    @Transient
    boolean isGlobalInject();
}
