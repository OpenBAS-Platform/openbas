package io.openex.injects.ovh_sms.form;

import io.openex.database.model.Inject;
import io.openex.injects.ovh_sms.OvhSmsContract;
import io.openex.injects.ovh_sms.model.OvhSmsContent;
import io.openex.injects.ovh_sms.model.OvhSmsInject;
import io.openex.rest.inject.form.InjectCreateInput;

public class OvhSmsForm extends InjectCreateInput<OvhSmsContent> {

    @Override
    public Inject<OvhSmsContent> toInject() {
        OvhSmsInject smsInject = new OvhSmsInject();
        smsInject.setTitle(getTitle());
        smsInject.setDescription(getDescription());
        smsInject.setDate(getDate());
        smsInject.setType(OvhSmsContract.NAME);
        smsInject.setContent(getContent());
        smsInject.setAllAudiences(getAllAudiences());
        return smsInject;
    }
}
