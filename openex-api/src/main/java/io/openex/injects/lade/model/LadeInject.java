package io.openex.injects.lade.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.execution.Executor;
import io.openex.injects.lade.LadeExecutor;
import io.openex.injects.lade.converter.LadeContentConverter;
import io.openex.injects.lade.model.LadeContent;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_lade")
public class LadeInject extends Inject {

    @Column(name = "inject_content")
    @Convert(converter = LadeContentConverter.class)
    @JsonProperty("inject_content")
    private LadeContent content;

    public LadeContent getContent() {
        return content;
    }

    public void setContent(LadeContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<?>> executor() {
        return LadeExecutor.class;
    }
}
