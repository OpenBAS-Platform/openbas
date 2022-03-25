package io.openex.injects.lade;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractField;
import io.openex.injects.lade.config.LadeConfig;
import io.openex.injects.lade.model.LadeForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractType.Textarea;
import static io.openex.contract.ContractType.Select;

@Component
public class LadeContract implements Contract {

    public static final String NAME = "openex_lade";

    private LadeConfig config;

    public LadeContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(LadeForm.class, LadeContract.NAME));
    }

    @Autowired
    public void setConfig(LadeConfig config) {
        this.config = config;
    }

    @Override
    public boolean isExpose() {
        return config.getEnable();
    }

    @Override
    public String getType() {
        return NAME;
    }

    @Override
    public List<ContractField> getFields() {
        return contractBuilder()
                .mandatory("workzone_identifier")
                .mandatory("action", Select)
                .mandatory("parameters", Textarea)
                .build();
    }
}
