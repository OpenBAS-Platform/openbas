package io.openex.player.model.database;

import org.springframework.beans.BeanUtils;

import javax.persistence.Transient;

public interface Base {
    String getId();

    @Transient
    default Base setUpdateAttributes(Object input) {
        BeanUtils.copyProperties(input, this);
        return this;
    }
}
