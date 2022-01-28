package io.openex.injects.manual.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.execution.Executor;
import io.openex.injects.manual.ManualExecutor;
import io.openex.injects.manual.converter.ManualContentConverter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_manual")
public class ManualInject extends Inject {

    @Column(name = "inject_content")
    @Convert(converter = ManualContentConverter.class)
    @JsonProperty("inject_content")
    private ManualContent content;

    public ManualContent getContent() {
        return content;
    }

    public void setContent(ManualContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<ManualInject>> executor() {
        return ManualExecutor.class;
    }
}
