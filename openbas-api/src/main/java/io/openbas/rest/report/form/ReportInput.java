package io.openbas.rest.report.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class ReportInput {
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("report_name")
    private String name;

    @JsonProperty("report_informations")
    private List<ReportInformationInput> reportInformations;
}
