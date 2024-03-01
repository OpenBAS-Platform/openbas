package io.openbas.database.model;

import org.springframework.beans.BeanUtils;

import jakarta.persistence.Transient;

public interface Base {
    String getId();

    void setId(String id);

    default boolean isUserHasAccess(final boolean isAdmin) {
        return isAdmin;
    }

    default boolean isUserHasAccess(User user) {
        return this.isUserHasAccess(user.isAdmin());
    }

    @Transient
    default void setUpdateAttributes(Object input) {
        BeanUtils.copyProperties(input, this);
    }
}
