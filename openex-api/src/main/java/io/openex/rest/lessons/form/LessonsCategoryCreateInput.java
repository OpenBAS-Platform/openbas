package io.openex.rest.lessons.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class LessonsCategoryCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("lessons_category_name")
    private String name;

    @JsonProperty("lessons_category_description")
    private String description;

    @JsonProperty("lessons_category_order")
    private int order;

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

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
}
