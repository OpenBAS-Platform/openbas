package io.openex.sms.ovh;

import org.apache.camel.Endpoint;
import org.apache.camel.impl.UriEndpointComponent;

import java.util.Map;

/**
 * Created by Julien on 06/01/2017.
 */
@SuppressWarnings("PackageAccessibility")
public class OvhSmsComponent extends UriEndpointComponent {
	public OvhSmsComponent() {
		super(OvhSmsEndpoint.class);
	}
	
	@Override
	protected Endpoint createEndpoint(String uri, String remaining, Map<String, Object> parameters) throws Exception {
		return new OvhSmsEndpoint(uri, this);
	}
}
