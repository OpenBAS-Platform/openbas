package io.openex.database.model;

import org.springframework.beans.BeanUtils;

import javax.persistence.Transient;

public interface Base {
    String getId();

    void setId(String id);

    default boolean isUserHasAccess(User user) {
        return user.isAdmin();
    }

    @Transient
    default void setUpdateAttributes(Object input) {
        BeanUtils.copyProperties(input, this);
    }
}
