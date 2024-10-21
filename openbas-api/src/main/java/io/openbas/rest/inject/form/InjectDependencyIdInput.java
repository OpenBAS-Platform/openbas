package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDependencyConditions;
import io.openbas.database.model.InjectDependencyId;
import io.openbas.helper.MonoIdDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InjectDependencyIdInput {

    @JsonProperty("inject_parent_id")
    private String injectParentId;

    @JsonProperty("inject_children_id")
    private String injectChildrenId;

}
