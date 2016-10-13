package io.openex.scheduler;

import io.openex.management.Executor;
import io.openex.management.registry.WorkerRegistry;
import org.apache.camel.CamelContext;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.impl.SimpleRegistry;
import org.apache.camel.model.RouteDefinition;
import org.jdom2.*;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;

/**
 * Created by Julien on 13/10/2016.
 */
@Component
@SuppressWarnings("PackageAccessibility")
public class Scheduler {
	
	private WorkerRegistry workerRegistry;
	private CamelContext context;
	
	public Scheduler() {
		SimpleRegistry registry = new SimpleRegistry();
		registry.put("schedulerRouter", new SchedulerRouter());
		context = new DefaultCamelContext(registry);
	}
	
	@Activate
	private void starter() throws Exception {
		System.out.println("<<<<<<<<< ROUTE STARTING >>>>>>>>>>>>>");
		context.setTracing(true);
		Collection<Executor> declaratedWorkers = workerRegistry.workers().values();
		List<RouteDefinition> definitions = new ArrayList<>();
		for (Executor executor : declaratedWorkers) {
			System.out.println("<<<<<<<<< ROUTE STARTING: " + executor.name());
			List<RouteDefinition> routes = createRoute(context, executor);
			Set<Map.Entry<String, org.apache.camel.Component>> componentEntries = executor.components().entrySet();
			for (Map.Entry<String, org.apache.camel.Component> componentEntry : componentEntries) {
				context.addComponent(componentEntry.getKey(), componentEntry.getValue());
			}
			definitions.addAll(routes);
		}
		
		InputStream defaultRoutesStream = getClass().getResourceAsStream("routes.xml");
		List<RouteDefinition> initRoutes = context.loadRoutesDefinition(defaultRoutesStream).getRoutes();
		definitions.addAll(initRoutes);
		
		context.addRouteDefinitions(definitions);
		context.start();
	}
	
	@Deactivate
	public void stop() throws Exception {
		context.stop();
	}
	
	@Reference
	@SuppressWarnings("unused")
	public void setWorkerRegistry(WorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
	
	private List<RouteDefinition> createRoute(CamelContext context, Executor executor) throws Exception {
		Element routes = new Element("routes", Namespace.getNamespace("http://camel.apache.org/schema/spring"));
		Element routeElement = new Element("route", Namespace.NO_NAMESPACE);
		Element from = new Element("from");
		from.setAttribute("uri", "direct:"+executor.name());
		routeElement.addContent(from);
		
		SAXBuilder sxb = new SAXBuilder();
		Document document = sxb.build(executor.route());
		List<Element> processingElement = document.getRootElement().getChildren();
		for (Element element : processingElement) {
			routeElement.addContent(element.clone().detach());
		}
		
		Element to = new Element("to");
		to.setAttribute("uri", "direct:callback");
		routes.addContent(routeElement);
		
		String route = new XMLOutputter().outputString(routes);
		ByteArrayInputStream inputStream = new ByteArrayInputStream(route.getBytes("UTF-8"));
		return context.loadRoutesDefinition(inputStream).getRoutes();
	}
}