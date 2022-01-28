package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.execution.Executor;
import io.openex.injects.ovh_sms.OvhSmsExecutor;
import io.openex.injects.ovh_sms.converter.OvhSmsContentConverter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_ovh_sms")
public class OvhSmsInject extends Inject {

    @Column(name = "inject_content")
    @Convert(converter = OvhSmsContentConverter.class)
    @JsonProperty("inject_content")
    private OvhSmsContent content;

    public OvhSmsContent getContent() {
        return content;
    }

    public void setContent(OvhSmsContent content) {
        this.content = content;
    }

    public Class<? extends Executor<?>> executor() {
        return OvhSmsExecutor.class;
    }
}
