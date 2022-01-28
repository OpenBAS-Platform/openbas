package io.openex.injects.mastodon.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import io.openex.rest.inject.form.InjectInput;

public class MastodonForm extends InjectInput {

    @JsonProperty("inject_content")
    private MastodonContent content;

    public MastodonContent getContent() {
        return content;
    }

    public void setContent(MastodonContent content) {
        this.content = content;
    }

    @Override
    public Inject init() {
        MastodonInject mastodonInject = new MastodonInject();
        mastodonInject.setContent(content);
        return mastodonInject;
    }
}
