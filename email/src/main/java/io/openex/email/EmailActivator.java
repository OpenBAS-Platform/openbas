package io.openex.email;

import io.openex.management.registry.WorkerRegistry;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * Created by Julien on 13/10/2016.
 */
@Component(name = "EmailActivator")
public class EmailActivator {
	
	private WorkerRegistry workerRegistry;
	
	private final EmailExecutor executor;
	
	public EmailActivator() {
		this.executor = new EmailExecutor();
	}
	
	@Activate
	public void start() throws Exception {
		System.out.println(">>>>>>>>> start EmailActivator");
		workerRegistry.addWorker(executor);
	}
	
	@Deactivate
	public void stop() throws Exception {
		System.out.println(">>>>>>>>> stop EmailActivator");
		workerRegistry.removeWorker(executor);
	}
	
	@Reference
	public void setWorkerRegistry(WorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}
