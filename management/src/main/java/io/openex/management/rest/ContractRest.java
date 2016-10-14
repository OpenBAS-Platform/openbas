package io.openex.management.rest;

import io.openex.management.Executor;
import io.openex.management.registry.WorkerRegistry;
import org.apache.commons.io.IOUtils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("")
@Component(service = ContractRest.class,
		property = {
				"service.exported.interfaces=*",
				"service.exported.configs=org.apache.cxf.rs",
				"org.apache.cxf.rs.address=/contracts"
		})
@SuppressWarnings("PackageAccessibility")
public class ContractRest {
	
	private WorkerRegistry workerRegistry;
	
	@Context
	UriInfo uri;
	
	@GET
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
	
	@Reference
	public void setWorkerRegistry(WorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}