package io.openex.injects.manual;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractDef;
import io.openex.injects.manual.model.ManualForm;
import org.springframework.stereotype.Component;

import static io.openex.contract.ContractType.Textarea;

@Component
public class ManualContract extends Contract {

    public static final String NAME = "openex_manual";

    public ManualContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(ManualForm.class, ManualContract.NAME));
    }

    @Override
    public boolean expose() {
        return true;
    }

    @Override
    public String id() {
        return NAME;
    }

    @Override
    public ContractDef definition() {
        return ContractDef.build().mandatory("content", Textarea);
    }
}
