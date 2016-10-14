package io.openex.email;

import io.openex.management.contract.Contract;
import io.openex.management.Executor;
import org.apache.camel.Component;
import org.apache.camel.component.stream.StreamComponent;

import java.io.InputStream;
import java.util.Collections;
import java.util.Map;

@SuppressWarnings("PackageAccessibility")
class EmailExecutor implements Executor {

	public String name() {
		return "email";
	}
	
	public Contract exposeContract() {
		return new EmailContract();
	}
	
	public InputStream route() {
		return getClass().getResourceAsStream("worker.xml");
	}

	public Map<String, Component> components() {
		Component v = new StreamComponent();
		return Collections.singletonMap("stream", v);
	}
}
