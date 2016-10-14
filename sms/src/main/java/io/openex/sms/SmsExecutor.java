package io.openex.sms;

import io.openex.management.Executor;
import org.apache.camel.Component;
import org.apache.camel.component.stream.StreamComponent;

import java.io.InputStream;
import java.util.Collections;
import java.util.Map;

@SuppressWarnings("PackageAccessibility")
class SmsExecutor implements Executor {
	
	public String name() {
		return "sms";
	}
	
	public InputStream contract() {return getClass().getResourceAsStream("contract.json");}
	
	public InputStream route() {
		return getClass().getResourceAsStream("worker.xml");
	}
	
	public Map<String, Component> components() {
		Component v = new StreamComponent();
		return Collections.singletonMap("stream", v);
	}
}
