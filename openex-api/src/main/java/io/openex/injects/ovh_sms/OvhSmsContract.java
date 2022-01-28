package io.openex.injects.ovh_sms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractDef;
import io.openex.injects.ovh_sms.config.OvhSmsConfig;
import io.openex.injects.ovh_sms.model.OvhSmsForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractType.Audience;
import static io.openex.contract.ContractType.Textarea;

@Component
public class OvhSmsContract extends Contract {

    public static final String NAME = "openex_ovh_sms";

    private OvhSmsConfig config;

    public OvhSmsContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(OvhSmsForm.class, OvhSmsContract.NAME));
    }

    @Autowired
    public void setConfig(OvhSmsConfig config) {
        this.config = config;
    }

    @Override
    public boolean expose() {
        return config.getEnable();
    }

    @Override
    public String id() {
        return NAME;
    }

    @Override
    public ContractDef definition() {
        return ContractDef.build()
                .mandatory("audiences", Audience, Multiple)
                .mandatory("message", Textarea);
    }
}
