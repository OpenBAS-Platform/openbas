package io.openex.injects.lade.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.InjectContent;
import org.springframework.util.StringUtils;

import java.util.Objects;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LadeContent extends InjectContent {

    @JsonProperty("workzone_identifier")
    private String workzoneIdentifier;

    @JsonProperty("action")
    private String action;

    @JsonProperty("parameters")
    private String parameters;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LadeContent that = (LadeContent) o;
        return Objects.equals(workzoneIdentifier, that.workzoneIdentifier) && Objects.equals(action, that.action) && Objects.equals(parameters, that.parameters);
    }

    public String getWorkzoneIdentifier() {
        return workzoneIdentifier;
    }

    public void setWorkzoneIdentifier(String workzoneIdentifier) {
        this.workzoneIdentifier = workzoneIdentifier;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getParameters() {
        return parameters;
    }

    public void setParameters(String parameters) {
        this.parameters = parameters;
    }

    @Override
    public int hashCode() {
        return Objects.hash(workzoneIdentifier, action, parameters);
    }
}
