package io.openex.injects.manual.form;

import io.openex.database.model.Inject;
import io.openex.injects.manual.model.ManualContent;
import io.openex.injects.manual.model.ManualInject;
import io.openex.rest.inject.form.InjectInput;

public class ManualForm extends InjectInput<ManualContent> {

    @Override
    public Inject<ManualContent> injectInstance() {
        return new ManualInject();
    }
}
