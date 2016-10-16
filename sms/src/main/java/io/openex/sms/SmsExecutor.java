package io.openex.sms;

import io.openex.management.Executor;
import org.apache.camel.Component;
import org.apache.camel.component.stream.StreamComponent;

import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("PackageAccessibility")
class SmsExecutor implements Executor {
	
	public String name() {
		return "sms";
	}
	
	public Map<String, Component> components() {
		return Collections.singletonMap("stream", new StreamComponent());
	}
}
