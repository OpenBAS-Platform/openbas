package io.openbas.rest.lessons_template.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class LessonsTemplateCategoryInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("lessons_template_category_name")
    private String name;

    @JsonProperty("lessons_template_category_description")
    private String description;

    @JsonProperty("lessons_template_category_order")
    @NotNull
    private int order;

}
