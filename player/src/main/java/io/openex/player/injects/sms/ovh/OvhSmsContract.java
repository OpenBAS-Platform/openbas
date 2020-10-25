package io.openex.player.injects.sms.ovh;

import io.openex.player.contract.ContractDef;
import io.openex.player.model.Contract;
import io.openex.player.model.inject.InjectBase;

import static io.openex.player.contract.ContractType.Textarea;

@SuppressWarnings("unused")
public class OvhSmsContract extends Contract {

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
