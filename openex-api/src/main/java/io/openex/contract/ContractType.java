package io.openex.contract;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContractType {
    @JsonProperty("text")
    Text,
    @JsonProperty("checkbox")
    Checkbox,
    @JsonProperty("textarea")
    Textarea,
    @JsonProperty("select")
    Select,
    @JsonProperty("richtextarea")
    Richtextarea,
    @JsonProperty("attachment")
    Attachment,
    @JsonProperty("audience")
    Audience
}
