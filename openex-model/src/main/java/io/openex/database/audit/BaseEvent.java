package io.openex.database.audit;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.Base;
import io.openex.database.model.User;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

public class BaseEvent {

    @JsonIgnore
    private final String sessionId;

    @JsonProperty("event_type")
    private String type;

    @JsonProperty("attribute_id")
    private String attributeId;

    @JsonProperty("attribute_schema")
    private String schema;

    @JsonIgnore
    private final Base instance;

    @JsonProperty("instance")
    private JsonNode instanceData;

    public BaseEvent(String type, Base data, ObjectMapper mapper) {
        this.type = type;
        this.instance = data;
        this.instanceData = mapper.valueToTree(instance);
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        this.sessionId = requestAttributes != null ? requestAttributes.getSessionId() : null;
        Class<? extends Base> currentClass = data.getClass();
        boolean isTargetClass = currentClass.getSuperclass().equals(Object.class);
        Class<?> baseClass = isTargetClass ? currentClass : currentClass.getSuperclass();
        String className = baseClass.getSimpleName().toLowerCase();
        this.attributeId = className + "_id";
        this.schema = className + (className.endsWith("s") ? "es" : "s");
    }

    public String getSessionId() {
        return sessionId;
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

    public JsonNode getInstanceData() {
        return instanceData;
    }

    public void setInstanceData(JsonNode instanceData) {
        this.instanceData = instanceData;
    }

    @JsonIgnore
    public boolean isUserObserver(User listener) {
        return instance.isUserHasAccess(listener);
    }
}
