package io.openex.database.model;

import org.springframework.beans.BeanUtils;

import javax.persistence.Transient;

public interface Base {
    String getId();

    @Transient
    default void setUpdateAttributes(Object input) {
        BeanUtils.copyProperties(input, this);
    }
}
