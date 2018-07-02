package io.openex.email;

import io.openex.management.registry.IWorkerRegistry;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * Created by Julien on 13/10/2016.
 */
@Component(name = "EmailActivator")
public class EmailActivator {
	
	private IWorkerRegistry workerRegistry;
	
	private final EmailExecutor executor;
	
	public EmailActivator() {
		this.executor = new EmailExecutor();
	}
	
	@Activate
	public void start() throws Exception {
		workerRegistry.addWorker(executor);
	}
	
	@Deactivate
	public void stop() throws Exception {
		workerRegistry.removeWorker(executor);
	}
	
	@Reference
	public void setWorkerRegistry(IWorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}
