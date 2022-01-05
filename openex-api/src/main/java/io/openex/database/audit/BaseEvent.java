package io.openex.database.audit;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Base;
import io.openex.database.model.User;

public class BaseEvent {

    @JsonProperty("event_type")
    private String type;

    @JsonProperty("attribute_id")
    private String attributeId;

    @JsonProperty("attribute_schema")
    private String schema;

    @JsonProperty("instance")
    private Base instance;

    public BaseEvent() {
        // Default constructor
    }

    public BaseEvent(String type, Base data) {
        this.type = type;
        this.instance = data;
        String className = data.getClass().getSimpleName().toLowerCase();
        this.attributeId = className + "_id";
        this.schema = className + "s";
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAttributeId() {
        return attributeId;
    }

    public void setAttributeId(String attributeId) {
        this.attributeId = attributeId;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public Base getInstance() {
        return instance;
    }

    public void setInstance(Base instance) {
        this.instance = instance;
    }

    public boolean isUserObserver(User listener) {
        return instance.isUserObserver(listener);
    }
}
