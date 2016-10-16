package io.openex.scheduler;

import io.openex.management.Executor;
import io.openex.management.registry.WorkerListener;
import io.openex.management.registry.WorkerRegistry;
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.ThreadPoolRejectedPolicy;
import org.apache.camel.component.gson.GsonDataFormat;
import org.apache.camel.component.http4.HttpComponent;
import org.apache.camel.component.properties.PropertiesComponent;
import org.apache.camel.http.common.HttpOperationFailedException;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.impl.SimpleRegistry;
import org.apache.camel.model.ProcessorDefinition;
import org.apache.camel.model.RouteDefinition;
import org.apache.camel.model.dataformat.JsonDataFormat;
import org.apache.camel.model.dataformat.JsonLibrary;
import org.apache.camel.spi.ThreadPoolProfile;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.Namespace;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

import org.apache.camel.builder.Builder;

@Component
@SuppressWarnings("PackageAccessibility")
public class Scheduler {
	
	private static final String SCHEDULER_KEY = "scheduler";
	private WorkerRegistry workerRegistry;
	private CamelContext context;
	
	@Activate
	private void starter() throws Exception {
		System.out.println(">>>>>>>>>>>>> Scheduler starter");
		workerRegistry.addListener(SCHEDULER_KEY, new WorkerListener() {
			@Override
			public void onWorkerAdded(Executor executor) throws Exception {
				System.out.println(">>>>>>>>>>>>> onWorkerAdded: " + executor.name());
				registerExecutorComponent(executor);
				context.addRouteDefinitions(createRouteFromExecutor(executor));
			}
			
			@Override
			public void onWorkerRemoved(Executor executor) throws Exception {
				System.out.println(">>>>>>>>>>>>> onWorkerRemoved: " + executor.name());
				unregisterExecutorComponent(executor);
				context.removeRouteDefinitions(createRouteFromExecutor(executor));
			}
		});
		createContext();
	}
	
	@Deactivate
	public void stop() throws Exception {
		System.out.println(">>>>>>>>>>>>> Route stopping");
		workerRegistry.removeLister("scheduler");
		context.stop();
	}
	
	//region utils
	private void unregisterExecutorComponent(Executor... executors) {
		for (Executor executor : executors) {
			Set<String> keys = executor.components().keySet();
			for (String key : keys) {
				if (context.getComponentNames().contains(key)) {
					context.removeComponent(key);
				}
			}
		}
	}
	
	private void registerExecutorComponent(Executor... executors) {
		for (Executor executor : executors) {
			Set<Map.Entry<String, org.apache.camel.Component>> components = executor.components().entrySet();
			for (Map.Entry<String, org.apache.camel.Component> entry : components) {
				if (!context.getComponentNames().contains(entry.getKey())) {
					context.addComponent(entry.getKey(), entry.getValue());
				}
			}
		}
	}
	
	private ThreadPoolProfile profile() {
		//Define custom thread pool profile
		ThreadPoolProfile threadPoolProfile = new ThreadPoolProfile("openex-worker-thread-profile");
		threadPoolProfile.setPoolSize(20);
		threadPoolProfile.setMaxPoolSize(40);
		threadPoolProfile.setMaxQueueSize(1000);
		threadPoolProfile.setAllowCoreThreadTimeOut(false);
		threadPoolProfile.setRejectedPolicy(ThreadPoolRejectedPolicy.CallerRuns);
		return threadPoolProfile;
	}
	
	private List<RouteDefinition> createRouteFromExecutor(Executor executor) throws Exception {
		SAXBuilder sxb = new SAXBuilder();
		Document document = sxb.build(executor.route());
		Element routeElement = document.getRootElement().getChildren().iterator().next();
		Element to = new Element("to");
		to.setAttribute("uri", "direct:callback");
		routeElement.addContent(to);
		String route = new XMLOutputter().outputString(document);
		ByteArrayInputStream inputStream = new ByteArrayInputStream(route.getBytes("UTF-8"));
		return context.loadRoutesDefinition(inputStream).getRoutes();
		
	}
	//endregion
	
	private void createContext() throws Exception {
		SimpleRegistry registry = new SimpleRegistry();
		registry.put("schedulerRouter", new SchedulerRouter());
		registry.put("http", new HttpComponent());
		registry.put("json-gson", new GsonDataFormat());
		context = new DefaultCamelContext(registry);
		context.addComponent("properties", new PropertiesComponent("file:${karaf.home}/etc/openex.properties"));
		context.getExecutorServiceManager().registerThreadPoolProfile(profile());
		context.setTracing(true);
		//Building routes
		Collection<Executor> declaredWorkers = workerRegistry.workers().values();
		List<RouteDefinition> definitions = new ArrayList<>();
		for (Executor executor : declaredWorkers) {
			System.out.println(">>>>>>>>>>>>> ROUTE STARTING: " + executor.name());
			List<RouteDefinition> routes = createRouteFromExecutor(executor);
			definitions.addAll(routes);
		}
		//Populate data formats
		JsonDataFormat jsonDataFormat = new JsonDataFormat(JsonLibrary.Gson);
		jsonDataFormat.setUseList(true);
		//Populate components
		registerExecutorComponent(declaredWorkers.toArray(new Executor[declaredWorkers.size()]));
		context.setDataFormats(Collections.singletonMap("json", jsonDataFormat));
		//Populate routes
		InputStream defaultRoutesStream = getClass().getResourceAsStream("routes.xml");
		List<RouteDefinition> initRoutes = context.loadRoutesDefinition(defaultRoutesStream).getRoutes();
		definitions.addAll(initRoutes);
		context.addRouteDefinitions(definitions);
		//Starting context
		context.start();
	}
	
	@Reference
	@SuppressWarnings("unused")
	public void setWorkerRegistry(WorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}