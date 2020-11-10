package io.openex.player.injects.ovh_sms;

import io.openex.player.contract.ContractDef;
import io.openex.player.injects.ovh_sms.config.OvhSmsConfig;
import io.openex.player.model.Contract;
import io.openex.player.model.inject.InjectBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.openex.player.contract.ContractType.Textarea;

@Component
public class OvhSmsContract extends Contract {

    @Autowired
    private OvhSmsConfig config;

    @Override
    public boolean expose() {
        return config.getEnable();
    }

    @Override
    public String id() { return "openex_ovh_sms"; }

    @Override
    public ContractDef definition() {
        return ContractDef.build().mandatory("message", Textarea);
    }

    @Override
    public Class<? extends InjectBase> dataClass() {
        return OvhSmsInject.class;
    }
}
