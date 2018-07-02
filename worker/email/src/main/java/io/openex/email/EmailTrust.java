package io.openex.email;

import org.apache.camel.component.mail.DummyTrustManager;
import org.apache.camel.util.jsse.SSLContextParameters;
import org.apache.camel.util.jsse.TrustManagersParameters;

/**
 * Created by Julien on 19/12/2016.
 */
@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class EmailTrust extends SSLContextParameters {
	
	public EmailTrust() {
		TrustManagersParameters trustManagers = new TrustManagersParameters();
		trustManagers.setTrustManager(new DummyTrustManager());
		setTrustManagers(trustManagers);
	}
}
