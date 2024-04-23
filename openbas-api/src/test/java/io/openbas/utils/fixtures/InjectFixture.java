package io.openbas.utils.fixtures;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;
import jakarta.validation.constraints.NotNull;

import static io.openbas.injects.email.EmailContract.TYPE;

public class InjectFixture {

  public static final String INJECT_EMAIL_NAME = "Test email inject";

  public static Inject getInjectForEmailContract(@NotNull final InjectorContract injectorContract) {
    Inject inject = new Inject();
    inject.setTitle(INJECT_EMAIL_NAME);
    inject.setType(TYPE);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);
    return inject;
  }

}
