package io.openex.injects.ovh_sms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractField;
import io.openex.injects.ovh_sms.config.OvhSmsConfig;
import io.openex.injects.ovh_sms.model.OvhSmsForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractType.Audience;
import static io.openex.contract.ContractType.Textarea;

@Component
public class OvhSmsContract implements Contract {

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
                .mandatory("audiences", Audience, Multiple)
                .mandatory("message", Textarea)
                .build();
    }
}
