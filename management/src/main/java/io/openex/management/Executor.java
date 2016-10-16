package io.openex.management;

import org.apache.camel.Component;

import java.io.InputStream;
import java.util.Collections;
import java.util.Map;

/**
 * Created by Julien on 13/10/2016.
 */
@SuppressWarnings("PackageAccessibility")
public interface Executor {
	
	String name();
	
	default InputStream contract() {
		return getClass().getResourceAsStream("contract.json");
	}
	
	default InputStream routes() {
		return getClass().getResourceAsStream("routes.xml");
	}
	
	default Map<String, Component> components() {
		return Collections.emptyMap();
	}
	
	default Map<String, Object> beans() {
		return Collections.emptyMap();
	}
}
