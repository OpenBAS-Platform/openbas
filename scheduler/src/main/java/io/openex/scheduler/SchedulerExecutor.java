package io.openex.scheduler;

import io.openex.management.Executor;
import org.apache.camel.Component;
import org.apache.camel.component.gson.GsonDataFormat;
import org.apache.camel.component.http4.HttpComponent;

import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("PackageAccessibility")
class SchedulerExecutor implements Executor {
	
	public String name() {
		return "scheduler";
	}
	
	public InputStream contract() {
		return null;
	}
	
	public InputStream routes() {
		return getClass().getResourceAsStream("routes.xml");
	}
	
	public Map<String, Component> components() {
		return Collections.singletonMap("http", new HttpComponent());
	}
	
	public Map<String, Object> beans() {
		Map<String, Object> beans = new HashMap<>();
		beans.put("schedulerRouter", new SchedulerRouter());
		beans.put("json-gson", new GsonDataFormat());
		return beans;
	}
}
