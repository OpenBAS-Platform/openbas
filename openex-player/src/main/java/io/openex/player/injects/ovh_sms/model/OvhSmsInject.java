package io.openex.player.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.player.injects.ovh_sms.OvhSmsExecutor;
import io.openex.player.model.database.Inject;
import io.openex.player.model.Executor;

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

    public OvhSmsContent getContent() {
        return content;
    }

    public void setContent(OvhSmsContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<?>> executor() {
        return OvhSmsExecutor.class;
    }
}
