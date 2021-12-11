package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Dryrun;
import io.openex.injects.ovh_sms.OvhSmsExecutor;
import io.openex.database.model.Inject;
import io.openex.injects.ovh_sms.converter.OvhSmsContentConverter;
import io.openex.model.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import java.util.Date;

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

    @Override
    public DryInject<OvhSmsContent> toDryInject(Dryrun run, Date from, int speed) {
        OvhSmsDryInject dryInject = new OvhSmsDryInject();
        dryInject.setContent(getContent());
        dryInject.setType(getType());
        dryInject.setDate(accelerateDate(from, speed));
        dryInject.setRun(run);
        return dryInject;
    }
}
