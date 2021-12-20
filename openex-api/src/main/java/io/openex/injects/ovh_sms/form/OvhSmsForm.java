package io.openex.injects.ovh_sms.form;

import io.openex.database.model.Inject;
import io.openex.injects.ovh_sms.model.OvhSmsContent;
import io.openex.injects.ovh_sms.model.OvhSmsInject;
import io.openex.rest.inject.form.InjectInput;

public class OvhSmsForm extends InjectInput<OvhSmsContent> {

    @Override
    public Inject<OvhSmsContent> injectInstance() {
        return new OvhSmsInject();
    }
}
