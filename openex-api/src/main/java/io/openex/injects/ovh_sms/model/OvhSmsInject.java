package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Inject;
import io.openex.injects.ovh_sms.OvhSmsExecutor;
import io.openex.injects.ovh_sms.converter.OvhSmsContentConverter;
import io.openex.execution.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_ovh_sms")
public class OvhSmsInject extends Inject<OvhSmsContent> {

    @Column(name = "inject_content")
    @Convert(converter = OvhSmsContentConverter.class)
    @JsonProperty("inject_content")
    private OvhSmsContent content;

    @Override
    public OvhSmsContent getContent() {
        return content;
    }

    @Override
    public void setContent(OvhSmsContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<OvhSmsContent>> executor() {
        return OvhSmsExecutor.class;
    }

    @Override
    public DryInject<OvhSmsContent> toDry() {
        return new OvhSmsDryInject();
    }
}
