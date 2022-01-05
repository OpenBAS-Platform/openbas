package io.openex.database.audit;

import io.openex.database.model.Base;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;

@Component
public class ModelBaseListener {

    public static final String DATA_PERSIST = "DATA_FETCH_SUCCESS";
    public static final String DATA_UPDATE = "DATA_UPDATE_SUCCESS";
    public static final String DATA_DELETE = "DATA_DELETE_SUCCESS";

    private ApplicationEventPublisher appPublisher;

    @Autowired
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.appPublisher = applicationEventPublisher;
    }

    @PostPersist
    void postPersist(Object base) {
        appPublisher.publishEvent(new BaseEvent(DATA_PERSIST, (Base) base));
    }

    @PostUpdate
    void postUpdate(Object base) {
        appPublisher.publishEvent(new BaseEvent(DATA_UPDATE, (Base) base));
    }

    @PostRemove
    void postRemove(Object base) {
        appPublisher.publishEvent(new BaseEvent(DATA_DELETE, (Base) base));
    }
}
