package io.openex.scheduler;

import com.google.common.collect.ImmutableMap;
import io.openex.management.Executor;
import io.openex.management.contract.Contract;
import org.apache.camel.Component;
import org.apache.camel.component.gson.GsonDataFormat;
import org.apache.camel.component.http4.HttpComponent;

@SuppressWarnings("PackageAccessibility")
class SchedulerExecutor implements Executor {
	
	public String name() {
		return "openex_scheduler";
	}
	
	@Override
	public Contract contract() {
		return null;
	}
	
	@Override
	public ImmutableMap<String, Component> components() {
		return ImmutableMap.of("http", new HttpComponent());
	}
	
	@Override
	public ImmutableMap<String, Object> beans() {
		return ImmutableMap.of("json-gson", new GsonDataFormat());
	}
}
