package io.openex.injects.ovh_sms.model;

import io.openex.database.model.DryInject;
import io.openex.injects.ovh_sms.OvhSmsExecutor;
import io.openex.injects.ovh_sms.converter.OvhSmsContentConverter;
import io.openex.model.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_ovh_sms")
public class OvhSmsDryInject extends DryInject<OvhSmsContent> {

    @Column(name = "dryinject_content")
    @Convert(converter = OvhSmsContentConverter.class)
    private OvhSmsContent content;

    public OvhSmsContent getContent() {
        return content;
    }

    public void setContent(OvhSmsContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<OvhSmsContent>> executor() {
        return OvhSmsExecutor.class;
    }
}
