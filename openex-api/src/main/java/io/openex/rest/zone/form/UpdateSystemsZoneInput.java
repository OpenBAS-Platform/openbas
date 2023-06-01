package io.openex.rest.zone.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;
import java.util.List;

@Getter
@Setter
public class UpdateSystemsZoneInput {

    @NotEmpty
    @JsonProperty("zone_systems")
    private List<String> systemIds;

}
