package io.openbas.rest.mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class ExportMapperInput {

    @NotNull(message = MANDATORY_MESSAGE)
    @JsonProperty("ids_to_export")
    private List<String> idsToExport;

}
