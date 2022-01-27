package io.openex.injects.mastodon.form;

import io.openex.database.model.Inject;
import io.openex.injects.mastodon.model.MastodonContent;
import io.openex.injects.mastodon.model.MastodonInject;
import io.openex.rest.inject.form.InjectInput;

public class MastodonForm extends InjectInput<MastodonContent> {

    @Override
    public Inject<MastodonContent> injectInstance() {
        return new MastodonInject();
    }
}
