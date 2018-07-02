package io.openex.sms.ovh;

import org.apache.camel.*;
import org.apache.camel.impl.ProcessorEndpoint;
import org.apache.camel.spi.Metadata;
import org.apache.camel.spi.UriEndpoint;
import org.apache.camel.spi.UriParam;

@SuppressWarnings({"PackageAccessibility", "unused", "WeakerAccess"})
@UriEndpoint(scheme = "ovhSms", title = "OvhSms", syntax = "ovhSms:resourceUri", producerOnly = true)
public class OvhSmsEndpoint extends ProcessorEndpoint {
	
	@UriParam
	@Metadata(required = "true")
	private String ak;
	
	@UriParam
	@Metadata(required = "true")
	private String as;
	
	@UriParam
	@Metadata(required = "true")
	private String ck;
	
	@UriParam
	@Metadata(required = "true")
	private String service;

	public OvhSmsEndpoint(String endpointUri, Component component) {
		super(endpointUri, component);
	}
	
	@Override
	public Producer createProducer() throws Exception {
		return new OvhSmsProducer(this);
	}
	
	@Override
	public Consumer createConsumer(Processor processor) throws Exception {
		throw new RuntimeCamelException("Cannot consume to a ovhSms: " + getEndpointUri());
	}
	
	public String getAk() {
		return ak;
	}
	
	public void setAk(String ak) {
		this.ak = ak;
	}
	
	public String getAs() {
		return as;
	}
	
	public void setAs(String as) {
		this.as = as;
	}
	
	public String getCk() {
		return ck;
	}
	
	public void setCk(String ck) {
		this.ck = ck;
	}
	
	public String getService() {
		return service;
	}
	
	public void setService(String service) {
		this.service = service;
	}
}
