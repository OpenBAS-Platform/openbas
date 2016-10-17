package io.openex.management.rest;

import com.google.gson.Gson;
import io.openex.management.Executor;
import io.openex.management.camel.IOpenexContext;
import io.openex.management.registry.IWorkerRegistry;
import org.apache.camel.builder.ProxyBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.commons.io.IOUtils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("")
@Component(service = WorkerRest.class,
		property = {
				"service.exported.interfaces=*",
				"service.exported.configs=org.apache.cxf.rs",
				"org.apache.cxf.rs.address=/"
		})
@SuppressWarnings({"PackageAccessibility", "unused"})
public class WorkerRest {
	
	private IWorkerRegistry workerRegistry;
	private IOpenexContext openexContext;
	
	@Context
	UriInfo uri;
	
	@GET
	@Path("/contracts")
	@Produces(MediaType.APPLICATION_JSON)
	public List<RestContract> getContracts() throws IOException {
		List<RestContract> contracts = new ArrayList<>();
		Map<String, Executor> workers = workerRegistry.workers();
		for (Map.Entry<String, Executor> entry : workers.entrySet()) {
			if (entry.getValue().contract() != null) {
				RestContract restContract = new RestContract();
				restContract.setType(entry.getKey());
				restContract.setDefinition(IOUtils.toString(entry.getValue().contract(), "UTF-8"));
				contracts.add(restContract);
			}
		}
		return contracts;
	}
	
	@POST
	@Path("/worker/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SuppressWarnings("unchecked")
	public String executeWorker(@PathParam("id") String id, String jsonRequest) throws Exception {
		Gson gson = new Gson();
		DefaultCamelContext context = openexContext.getContext();
		AuditWorker auditWorker = new ProxyBuilder(context).endpoint("direct:remote").build(AuditWorker.class);
		Map jsonToCamelMap = gson.fromJson(jsonRequest, Map.class);
		jsonToCamelMap.put("route-id", id);
		return gson.toJson(auditWorker.auditMessage(jsonToCamelMap));
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