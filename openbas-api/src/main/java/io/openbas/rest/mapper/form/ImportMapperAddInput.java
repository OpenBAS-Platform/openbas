package io.openbas.rest.mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class ImportMapperAddInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("mapper_name")
    private String name;

    @Pattern(regexp="^[A-Z]{1,2}$")
    @JsonProperty("mapper_inject_type_column")
    @NotBlank
    private String injectTypeColumn;

    @JsonProperty("mapper_inject_importers")
    private List<InjectImporterAddInput> importers = new ArrayList<>();

}
