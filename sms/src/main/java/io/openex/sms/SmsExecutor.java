package io.openex.sms;

import com.google.common.collect.ImmutableMap;
import io.openex.management.Executor;
import io.openex.management.contract.Contract;
import org.apache.camel.Component;
import org.apache.camel.component.stream.StreamComponent;

@SuppressWarnings("PackageAccessibility")
class SmsExecutor implements Executor {
	
	public String name() {
		return "sms";
	}
	
	@Override
	public Contract contract() {
		return Contract.build().add("message");
	}
	
	@Override
	public ImmutableMap<String, Component> components() {
		return ImmutableMap.of("stream", new StreamComponent());
	}
}
