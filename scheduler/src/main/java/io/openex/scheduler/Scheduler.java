package io.openex.scheduler;

import io.openex.management.Executor;
import io.openex.management.registry.WorkerRegistry;
import org.apache.camel.CamelContext;
import org.apache.camel.Exchange;
import org.apache.camel.ThreadPoolRejectedPolicy;
import org.apache.camel.component.gson.GsonDataFormat;
import org.apache.camel.component.http4.HttpComponent;
import org.apache.camel.component.properties.PropertiesComponent;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.impl.SimpleRegistry;
import org.apache.camel.model.RouteDefinition;
import org.apache.camel.model.dataformat.JsonDataFormat;
import org.apache.camel.model.dataformat.JsonLibrary;
import org.apache.camel.spi.ThreadPoolProfile;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.Namespace;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;

import org.apache.camel.builder.Builder;

/**
 * Created by Julien on 13/10/2016.
 */
@Component
@SuppressWarnings("PackageAccessibility")
public class Scheduler {
	
	private WorkerRegistry workerRegistry;
	private CamelContext context;
	
	@Activate
	private void starter() throws Exception {
		SimpleRegistry registry = new SimpleRegistry();
		registry.put("schedulerRouter", new SchedulerRouter());
		registry.put("http", new HttpComponent());
		registry.put("json-gson", new GsonDataFormat());
		context = new DefaultCamelContext(registry);
		context.addComponent("properties", new PropertiesComponent("file:${karaf.home}/etc/openex.properties"));
		
		//Define custom thread pool profile
		ThreadPoolProfile threadPoolProfile = new ThreadPoolProfile("openex-worker-thread-profile");
		threadPoolProfile.setPoolSize(20);
		threadPoolProfile.setMaxPoolSize(40);
		threadPoolProfile.setMaxQueueSize(1000);
		threadPoolProfile.setAllowCoreThreadTimeOut(false);
		threadPoolProfile.setRejectedPolicy(ThreadPoolRejectedPolicy.CallerRuns);
		context.getExecutorServiceManager().registerThreadPoolProfile(threadPoolProfile);
		
		System.out.println("<<<<<<<<< ROUTE STARTING >>>>>>>>>>>>>");
		context.setTracing(true);
		Collection<Executor> declaratedWorkers = workerRegistry.workers().values();
		List<RouteDefinition> definitions = new ArrayList<>();
		Map<String, org.apache.camel.Component> components = new HashMap<>();
		for (Executor executor : declaratedWorkers) {
			System.out.println("<<<<<<<<< ROUTE STARTING: " + executor.name());
			List<RouteDefinition> routes = createRoute(context, executor);
			Set<Map.Entry<String, org.apache.camel.Component>> componentEntries = executor.components().entrySet();
			for (Map.Entry<String, org.apache.camel.Component> componentEntry : componentEntries) {
				components.put(componentEntry.getKey(), componentEntry.getValue());
			}
			definitions.addAll(routes);
		}
		
		JsonDataFormat jsonDataFormat = new JsonDataFormat(JsonLibrary.Gson);
		jsonDataFormat.setUseList(true);
		context.setDataFormats(Collections.singletonMap("json", jsonDataFormat));
		for (Map.Entry<String, org.apache.camel.Component> entry : components.entrySet()) {
			context.addComponent(entry.getKey(), entry.getValue());
		}
		
		InputStream defaultRoutesStream = getClass().getResourceAsStream("routes.xml");
		List<RouteDefinition> initRoutes = context.loadRoutesDefinition(defaultRoutesStream).getRoutes();
		definitions.addAll(initRoutes);
		definitions.add(callbackRoute());
		
		context.addRouteDefinitions(definitions);
		context.start();
	}
	
	@Deactivate
	public void stop() throws Exception {
		System.out.println("<<<<<<<<< ROUTE STOPPING >>>>>>>>>>>>>");
		context.stop();
		context = null;
	}
	
	@Reference
	@SuppressWarnings("unused")
	public void setWorkerRegistry(WorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
	
	private RouteDefinition callbackRoute() {
		RouteDefinition callback = new RouteDefinition();
		return callback.from("direct:callback")
				.setHeader(Exchange.CONTENT_TYPE, Builder.constant("application/json"))
				.setHeader(Exchange.HTTP_METHOD, Builder.constant("{{callback_mode}}"))
				.to("{{callback_uri}}")
				.to("stream:out");
	}
	
	private List<RouteDefinition> createRoute(CamelContext context, Executor executor) throws Exception {
		Element routes = new Element("routes", Namespace.getNamespace("http://camel.apache.org/schema/spring"));
		Element routeElement = new Element("route", Namespace.NO_NAMESPACE);
		Element from = new Element("from");
		from.setAttribute("uri", "direct:" + executor.name());
		routeElement.addContent(from);
		
		SAXBuilder sxb = new SAXBuilder();
		Document document = sxb.build(executor.route());
		List<Element> processingElement = document.getRootElement().getChildren();
		for (Element element : processingElement) {
			routeElement.addContent(element.clone().detach());
		}
		
		Element to = new Element("to");
		to.setAttribute("uri", "direct:callback");
		routeElement.addContent(to);
		routes.addContent(routeElement);
		
		String route = new XMLOutputter().outputString(routes);
		ByteArrayInputStream inputStream = new ByteArrayInputStream(route.getBytes("UTF-8"));
		return context.loadRoutesDefinition(inputStream).getRoutes();
	}
}