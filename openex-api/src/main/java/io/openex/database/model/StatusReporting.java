package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class StatusReporting {

    @JsonProperty("messages")
    private List<String> messages = new ArrayList<>();

    public StatusReporting() {
        // Nothing to do
    }

    public StatusReporting(List<String> messages) {
        this.messages = messages;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }
}
