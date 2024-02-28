package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class InjectUpdateTriggerInput {

    @JsonProperty("inject_depends_duration")
    private Long dependsDuration;

}
