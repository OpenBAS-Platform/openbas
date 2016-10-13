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
	@Override
	public String name() {
		return "email";
	}
	
	@Override
	public Contract exposeContract() {
		return new EmailContract();
	}
	
	@Override
	public InputStream route() {
		return getClass().getResourceAsStream("worker.xml");
	}
	
	@Override
	public Map<String, Component> components() {
		return Collections.singletonMap("stream", new StreamComponent());
	}
}
