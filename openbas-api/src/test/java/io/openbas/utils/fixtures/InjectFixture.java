package io.openbas.utils.fixtures;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;

public class InjectFixture {

  public static Inject getInject(String title, InjectorContract injectorContract) {
    Inject inject = new Inject();
    inject.setTitle(title);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);
    return inject;
  }
}
