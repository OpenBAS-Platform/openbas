package io.openbas.rest.lessons_template.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class LessonsTemplateCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("lessons_template_name")
    private String name;

    @JsonProperty("lessons_template_description")
    private String description;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
