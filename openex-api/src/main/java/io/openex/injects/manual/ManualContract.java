package io.openex.injects.manual;

import io.openex.contract.Contract;
import io.openex.contract.ContractDef;
import org.springframework.stereotype.Component;

import static io.openex.contract.ContractType.Textarea;

@Component
public class ManualContract extends Contract {

    public static final String NAME = "openex_manual";

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
