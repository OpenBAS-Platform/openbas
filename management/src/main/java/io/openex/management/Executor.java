package io.openex.management;

import io.openex.management.contract.Contract;
import org.apache.camel.Component;

import java.io.InputStream;
import java.util.Map;

/**
 * Created by Julien on 13/10/2016.
 */
@SuppressWarnings("PackageAccessibility")
public interface Executor {
	
	String name();
	
	Contract exposeContract();
	
	InputStream route();
	
	Map<String, Component> components();
}
