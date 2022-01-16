package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Inject;
import io.openex.injects.manual.ManualExecutor;
import io.openex.injects.manual.converter.ManualContentConverter;
import io.openex.execution.Executor;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_manual")
public class ManualInject extends Inject<ManualContent> {

    @Column(name = "inject_content")
    @Convert(converter = ManualContentConverter.class)
    @JsonProperty("inject_content")
    private ManualContent content;

    @Override
    public ManualContent getContent() {
        return content;
    }

    @Override
    public void setContent(ManualContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<ManualContent>> executor() {
        return ManualExecutor.class;
    }

    @Override
    public DryInject<ManualContent> toDry() {
        throw new UnsupportedOperationException("Manual inject cannot be converted to dryinject");
    }
}
