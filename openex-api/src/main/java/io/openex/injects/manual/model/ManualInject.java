package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Dryrun;
import io.openex.database.model.Inject;
import io.openex.injects.manual.converter.ManualContentConverter;
import io.openex.model.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import java.util.Date;

@Entity
@DiscriminatorValue("openex_manual")
public class ManualInject extends Inject<ManualContent> {

    @Column(name = "inject_content")
    @Convert(converter = ManualContentConverter.class)
    @JsonProperty("inject_content")
    private ManualContent content;

    public ManualContent getContent() {
        return content;
    }

    @Override
    public void setContent(ManualContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<ManualContent>> executor() {
        throw new UnsupportedOperationException("Manual inject cannot be executed");
    }

    @Override
    public DryInject<ManualContent> toDryInject(Dryrun run, Date from, int speed) {
        throw new UnsupportedOperationException("Manual inject cannot be converted to dryinject");
    }
}
