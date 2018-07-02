package io.openex.management;

import com.google.common.collect.ImmutableMap;
import io.openex.management.contract.Contract;
import org.apache.camel.Component;

import java.io.InputStream;

@SuppressWarnings("PackageAccessibility")
public interface Executor {
	
	String id();
	
	Contract contract();
	
	default InputStream routes() {
		return getClass().getResourceAsStream("routes.xml");
	}
	
	default ImmutableMap<String, Component> components() {
		return ImmutableMap.of();
	}
	
	default ImmutableMap<String, Object> beans() {
		return ImmutableMap.of();
	}
}
