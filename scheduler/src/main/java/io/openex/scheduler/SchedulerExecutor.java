package io.openex.scheduler;

import com.google.common.collect.ImmutableMap;
import io.openex.management.Executor;
import io.openex.management.contract.Contract;
import org.apache.camel.Component;
import org.apache.camel.component.gson.GsonDataFormat;
import org.apache.camel.component.http4.HttpComponent;
import org.apache.camel.component.quartz2.QuartzComponent;

@SuppressWarnings("PackageAccessibility")
class SchedulerExecutor implements Executor {
	
	public String id() {
		return "openex_scheduler";
	}
	
	@Override
	public Contract contract() {
		return null;
	}
	
	@Override
	public ImmutableMap<String, Component> components() {
		QuartzComponent quartzComponent = new QuartzComponent();
		quartzComponent.setEnableJmx(false); //Standalone scheduler, no need to register it in mbean
		return ImmutableMap.of("http", new HttpComponent(), "quartz", quartzComponent);
	}
	
	@Override
	public ImmutableMap<String, Object> beans() {
		return ImmutableMap.of("json-gson", new GsonDataFormat());
	}
}
