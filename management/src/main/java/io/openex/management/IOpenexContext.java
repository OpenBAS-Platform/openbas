package io.openex.management;

import io.openex.management.registry.IWorkerRegistry;
import org.apache.camel.impl.DefaultCamelContext;

/**
 * Created by Julien on 16/10/2016.
 */
@SuppressWarnings("PackageAccessibility")
public interface IOpenexContext {
	DefaultCamelContext getContext();
	
	IWorkerRegistry getWorkerRegistry();
	
	void refreshCamelModule(Executor executor) throws Exception;
}
