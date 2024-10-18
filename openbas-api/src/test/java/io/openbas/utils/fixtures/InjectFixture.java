package io.openbas.utils.fixtures;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;

import static io.openbas.injectors.email.EmailContract.TYPE;

public class InjectFixture {

  public static final String INJECT_EMAIL_NAME = "Test email inject";
  public static final String INJECT_SMS_NAME = "Test sms inject";

    /*
     public static final String OVH_DEFAULT = "e9e902bc-b03d-4223-89e1-fca093ac79dd";
     public static final String MASTODON_DEFAULT = "aeab9ed6-ae98-4b48-b8cc-2e91ac54f2f9";
     openbas_implant: 49229430-b5b5-431f-ba5b-f36f599b0144
     caldera: 7736918d-6a3f-46c7-b303-cbf5dc476c84
     */

  public static Inject getInjectForEmailContract(InjectorContract injectorContract) {
    Inject inject = new Inject();
    inject.setTitle(INJECT_EMAIL_NAME);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);
    return inject;
  }

  public static Inject getInjectForSmsContract(InjectorContract injectorContract) {
    Inject inject = new Inject();
    inject.setTitle(INJECT_SMS_NAME);
    inject.setInjectorContract(injectorContract);
    inject.setEnabled(true);
    inject.setDependsDuration(0L);
    return inject;
  }
}
