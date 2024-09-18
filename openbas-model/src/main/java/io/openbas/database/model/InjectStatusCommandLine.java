package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Objects;

@Getter
@Setter
public class InjectStatusCommandLine {

    @JsonProperty("content")
    private List<String> content;

    @JsonProperty("cleanup_command")
    private List<String> cleanupCommand;

    @JsonProperty("external_id")
    private String externalId;

    public InjectStatusCommandLine() {
        // Default constructor
    }

    public InjectStatusCommandLine(List<String> content, List<String> cleanupCommand, String externalId) {
        this.content = content;
        this.cleanupCommand = cleanupCommand;
        this.externalId = externalId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InjectStatusCommandLine that = (InjectStatusCommandLine) o;
        return Objects.equals(externalId, that.externalId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(content, cleanupCommand, externalId);
    }

    @Override
    public String toString() {
        return externalId + ": " + content + "\n" + cleanupCommand;
    }
}
