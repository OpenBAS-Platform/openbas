package io.openbas.utils.fixtures;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;

public class InjectFixture {

  public static final String INJECT_EMAIL_NAME = "Test email inject";

  public static Inject getInjectForEmailContract(InjectorContract injectorContract) {
    Inject inject = new Inject();
    inject.setTitle(INJECT_EMAIL_NAME);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);
    return inject;
  }

}
