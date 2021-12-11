package io.openex.player.model.database;

import io.openex.player.model.ContentBase;
import io.openex.player.model.Executor;

import javax.persistence.Transient;
import java.util.List;

public interface Injection<T extends ContentBase> {
    String getId();

    Exercise getExercise();

    Class<? extends Executor<? extends ContentBase>> executor();

    T getContent();

    @Transient
    default String getHeader() {
        return getExercise().getHeader();
    }

    @Transient
    default String getFooter() {
        return getExercise().getFooter();
    }

    @Transient
    default String getMessage() {
        return getContent().buildMessage(getFooter(), getHeader());
    }

    String getType();

    List<Audience> getAudiences();

    @Transient
    boolean isGlobalInject();
}
