package io.openex.injects.mastodon.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DryInject;
import io.openex.database.model.Inject;
import io.openex.execution.Executor;
import io.openex.injects.mastodon.MastodonExecutor;
import io.openex.injects.mastodon.converter.MastodonContentConverter;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("openex_mastodon")
public class MastodonInject extends Inject<MastodonContent> {

    @Column(name = "inject_content")
    @Convert(converter = MastodonContentConverter.class)
    @JsonProperty("inject_content")
    private MastodonContent content;

    @Override
    public MastodonContent getContent() {
        return content;
    }

    @Override
    public void setContent(MastodonContent content) {
        this.content = content;
    }

    @Override
    public Class<? extends Executor<MastodonContent>> executor() {
        return MastodonExecutor.class;
    }

    @Override
    public DryInject<MastodonContent> toDry() {
        return new MastodonDryInject();
    }
}
