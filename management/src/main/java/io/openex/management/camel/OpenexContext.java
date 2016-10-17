package io.openex.management.camel;

import io.openex.management.Executor;
import io.openex.management.registry.IWorkerListener;
import io.openex.management.registry.IWorkerRegistry;
import org.apache.camel.ThreadPoolRejectedPolicy;
import org.apache.camel.component.properties.PropertiesComponent;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.impl.PropertyPlaceholderDelegateRegistry;
import org.apache.camel.impl.SimpleRegistry;
import org.apache.camel.model.RouteDefinition;
import org.apache.camel.model.dataformat.JsonDataFormat;
import org.apache.camel.model.dataformat.JsonLibrary;
import org.apache.camel.spi.Registry;
import org.apache.camel.spi.ThreadPoolProfile;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

import java.io.InputStream;
import java.util.*;

@Component
@SuppressWarnings("PackageAccessibility")
public class OpenexContext implements IOpenexContext {
	
	private static final String OPENEX_CONTEXT_KEY = "OpenexContext";
	private DefaultCamelContext context = new DefaultCamelContext();
	private IWorkerRegistry workerRegistry;
	
	@Activate
	private void starter() throws Exception {
		System.out.println("START [OpenexContext]");
		workerRegistry.addListener(OPENEX_CONTEXT_KEY, new IWorkerListener() {
			@Override
			public void onWorkerAdded(Executor executor) throws Exception {
				System.out.println("ON WORKER ADDED [" + executor.name() + "]");
				registerExecutorComponent(executor);
				context.addRouteDefinitions(context.loadRoutesDefinition(executor.routes()).getRoutes());
			}
			
			@Override
			public void onWorkerRemoved(Executor executor) throws Exception {
				System.out.println("ON WORKER REMOVED [" + executor.name() + "]");
				unregisterExecutorComponent(executor);
				context.removeRouteDefinitions(context.loadRoutesDefinition(executor.routes()).getRoutes());
			}
		});
		createContext();
	}
	
	@Deactivate
	public void stop() throws Exception {
		System.out.println("STOP [OpenexContext]");
		workerRegistry.removeLister("scheduler");
		context.stop();
	}
	
	//region utils
	@SuppressWarnings("Convert2streamapi")
	private void unregisterExecutorComponent(Executor... executors) {
		for (Executor executor : executors) {
			//unregister beans
			Registry registry = context.getRegistry();
			if (registry instanceof PropertyPlaceholderDelegateRegistry) {
				registry = ((PropertyPlaceholderDelegateRegistry) registry).getRegistry();
			}
			SimpleRegistry openexRegistry = (SimpleRegistry) registry;
			Set<Map.Entry<String, Object>> beansEntries = executor.beans().entrySet();
			for (Map.Entry<String, Object> beansEntry : beansEntries) {
				if(openexRegistry.containsKey(beansEntry.getKey())) {
					openexRegistry.remove(beansEntry.getKey());
				}
			}
			//unregister components
			Set<String> keys = executor.components().keySet();
			for (String key : keys) {
				if (context.getComponentNames().contains(key)) {
					context.removeComponent(key);
				}
			}
		}
	}
	
	@SuppressWarnings("Convert2streamapi")
	private void registerExecutorComponent(Executor... executors) {
		for (Executor executor : executors) {
			//register beans
			Registry registry = context.getRegistry();
			if (registry instanceof PropertyPlaceholderDelegateRegistry) {
				registry = ((PropertyPlaceholderDelegateRegistry) registry).getRegistry();
			}
			SimpleRegistry openexRegistry = (SimpleRegistry) registry;
			Set<Map.Entry<String, Object>> beansEntries = executor.beans().entrySet();
			for (Map.Entry<String, Object> beansEntry : beansEntries) {
				if(!openexRegistry.containsKey(beansEntry.getKey())) {
					openexRegistry.put(beansEntry.getKey(), beansEntry.getValue());
				}
			}
			//register components
			Set<Map.Entry<String, org.apache.camel.Component>> components = executor.components().entrySet();
			for (Map.Entry<String, org.apache.camel.Component> entry : components) {
				if (!context.getComponentNames().contains(entry.getKey())) {
					context.addComponent(entry.getKey(), entry.getValue());
				}
			}
		}
	}
	
	private ThreadPoolProfile threadPoolProfileRemote() {
		//Define custom thread pool profile
		ThreadPoolProfile threadPoolProfile = new ThreadPoolProfile("openex-remote-thread-profile");
		threadPoolProfile.setPoolSize(10);
		threadPoolProfile.setMaxPoolSize(20);
		threadPoolProfile.setMaxQueueSize(500);
		threadPoolProfile.setAllowCoreThreadTimeOut(false);
		threadPoolProfile.setRejectedPolicy(ThreadPoolRejectedPolicy.Discard);
		return threadPoolProfile;
	}
	
	private ThreadPoolProfile threadPoolProfileExecutor() {
		//Define custom thread pool profile
		ThreadPoolProfile threadPoolProfile = new ThreadPoolProfile("openex-worker-thread-profile");
		threadPoolProfile.setPoolSize(20);
		threadPoolProfile.setMaxPoolSize(40);
		threadPoolProfile.setMaxQueueSize(1000);
		threadPoolProfile.setAllowCoreThreadTimeOut(false);
		threadPoolProfile.setRejectedPolicy(ThreadPoolRejectedPolicy.CallerRuns);
		return threadPoolProfile;
	}
	//endregion
	
	private void createContext() throws Exception {
		SimpleRegistry registry = new SimpleRegistry();
		context.setRegistry(registry);
		context.addComponent("properties", new PropertiesComponent("file:${karaf.home}/etc/openex.properties"));
		context.getExecutorServiceManager().registerThreadPoolProfile(threadPoolProfileRemote());
		context.getExecutorServiceManager().registerThreadPoolProfile(threadPoolProfileExecutor());
		context.setTracing(true);
		//Building routes
		Collection<Executor> declaredWorkers = workerRegistry.workers().values();
		List<RouteDefinition> definitions = new ArrayList<>();
		for (Executor executor : declaredWorkers) {
			List<RouteDefinition> routes = context.loadRoutesDefinition(executor.routes()).getRoutes();
			definitions.addAll(routes);
		}
		//Populate data formats
		JsonDataFormat jsonDataFormat = new JsonDataFormat(JsonLibrary.Gson);
		jsonDataFormat.setUseList(true);
		context.setDataFormats(Collections.singletonMap("json", jsonDataFormat));
		//Populate components
		registerExecutorComponent(declaredWorkers.toArray(new Executor[declaredWorkers.size()]));
		//Populate routes
		InputStream defaultRoutesStream = getClass().getResourceAsStream("routes.xml");
		List<RouteDefinition> initRoutes = context.loadRoutesDefinition(defaultRoutesStream).getRoutes();
		definitions.addAll(initRoutes);
		context.addRouteDefinitions(definitions);
		//Starting context
		context.start();
	}
	
	public DefaultCamelContext getContext() {
		return context;
	}
	
	@Reference
	@SuppressWarnings("unused")
	public void setWorkerRegistry(IWorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}