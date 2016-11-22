package io.openex.management.rest;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.openex.management.Executor;
import io.openex.management.IOpenexContext;
import io.openex.management.registry.IWorkerRegistry;
import org.apache.camel.builder.ProxyBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Path("")
@Component(service = WorkerRest.class,
		property = {
				"service.exported.interfaces=*",
				"service.exported.configs=org.apache.cxf.rs",
				"org.apache.cxf.rs.address=/"
		})
@SuppressWarnings({"PackageAccessibility", "unused"})
public class WorkerRest {
	private Gson gson;
	private IWorkerRegistry workerRegistry;
	private IOpenexContext openexContext;
	
	@Context
	UriInfo uri;
	
	public WorkerRest() {
		GsonBuilder builder = new GsonBuilder();
		builder.setPrettyPrinting();
		gson = builder.create();
	}
	
	@GET
	@Path("/heartbeat")
	@Produces(MediaType.APPLICATION_JSON)
	public String heartbeat() {
		Set<String> workers = workerRegistry.workers().values().stream()
				.filter(executor -> executor.contract() != null)
				.map(Executor::name).collect(Collectors.toSet());
		return gson.toJson(new RestHeartbeat(workers));
	}
	
	@GET
	@Path("/contracts")
	@Produces(MediaType.APPLICATION_JSON)
	public String getContracts() throws IOException {
		List<RestContract> contracts = workerRegistry.workers().values().stream()
				.filter(executor -> executor.contract() != null)
				.map(executor -> new RestContract(executor.name(), executor.contract().getFields()))
				.collect(Collectors.toList());
		return gson.toJson(contracts);
	}
	
	@POST
	@Path("/worker/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SuppressWarnings("unchecked")
	public String executeWorker(@PathParam("id") String id, String jsonRequest) throws Exception {
		DefaultCamelContext context = openexContext.getContext();
		AuditWorker auditWorker = new ProxyBuilder(context).endpoint("direct:remote")
				.build(AuditWorker.class);
		Map jsonToCamelMap = gson.fromJson(jsonRequest, Map.class);
		jsonToCamelMap.put("route-id", id);
		auditWorker.auditMessage(jsonToCamelMap);
		return gson.toJson("Execution success");
	}
	
	@Reference
	public void setWorkerRegistry(IWorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
	
	@Reference
	public void setOpenexContext(IOpenexContext openexContext) {
		this.openexContext = openexContext;
	}
}