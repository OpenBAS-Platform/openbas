package io.openex.management.rest;

import com.google.gson.Gson;
import io.openex.management.Executor;
import io.openex.management.registry.WorkerRegistry;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.ProxyBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.model.RouteDefinition;
import org.apache.commons.io.IOUtils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Path("")
@Component(service = ContractRest.class,
		property = {
				"service.exported.interfaces=*",
				"service.exported.configs=org.apache.cxf.rs",
				"org.apache.cxf.rs.address=/"
		})
@SuppressWarnings("PackageAccessibility")
public class ContractRest {
	
	private WorkerRegistry workerRegistry;
	
	@Context
	UriInfo uri;
	
	@GET
	@Path("/contracts")
	@Produces(MediaType.APPLICATION_JSON)
	public List<RestContract> getContracts() throws IOException {
		List<RestContract> contracts = new ArrayList<>();
		Map<String, Executor> workers = workerRegistry.workers();
		for (Map.Entry<String, Executor> entry : workers.entrySet()) {
			RestContract restContract = new RestContract();
			restContract.setType(entry.getKey());
			restContract.setDefinition(IOUtils.toString(entry.getValue().contract(), "UTF-8"));
			contracts.add(restContract);
		}
		return contracts;
	}
	
	@GET
	@Path("/worker/{id}")
	public String executeWorker(@PathParam("id") String id) throws Exception {
		//Build context
		Executor executor = workerRegistry.workers().get(id);
		CamelContext context = new DefaultCamelContext();
		registerExecutorComponent(context, executor);
		List<RouteDefinition> routes = context.loadRoutesDefinition(executor.route()).getRoutes();
		context.addRouteDefinitions(routes);
		context.start();
		//Audit result
		AuditWorker auditWorker = new ProxyBuilder(context).endpoint("direct:"+id).build(AuditWorker.class);
		Map anotherStr = new Gson().fromJson("{\"exercise_id\": \"test\"}", Map.class);
		String coucou = auditWorker.auditMessage(anotherStr);
		//Stopping and return result.
		context.stop();
		return coucou;
	}
	
	private void registerExecutorComponent(CamelContext context, Executor... executors) {
		for (Executor executor : executors) {
			Set<Map.Entry<String, org.apache.camel.Component>> components = executor.components().entrySet();
			for (Map.Entry<String, org.apache.camel.Component> entry : components) {
				if (!context.getComponentNames().contains(entry.getKey())) {
					context.addComponent(entry.getKey(), entry.getValue());
				}
			}
		}
	}
	
	@Reference
	public void setWorkerRegistry(WorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}