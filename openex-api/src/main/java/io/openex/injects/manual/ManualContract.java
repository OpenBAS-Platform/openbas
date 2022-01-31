package io.openex.injects.manual;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractField;
import io.openex.injects.manual.model.ManualForm;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractType.Textarea;

@Component
public class ManualContract implements Contract {

    public static final String NAME = "openex_manual";

    public ManualContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(ManualForm.class, ManualContract.NAME));
    }

    @Override
    public boolean isExpose() {
        return true;
    }

    @Override
    public String getType() {
        return NAME;
    }

    @Override
    public List<ContractField> getFields() {
        return contractBuilder()
                .mandatory("content", Textarea)
                .build();
    }
}
