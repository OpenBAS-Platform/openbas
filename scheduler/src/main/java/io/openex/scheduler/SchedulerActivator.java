package io.openex.scheduler;

import io.openex.management.registry.IWorkerRegistry;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

@Component(name = "SchedulerActivator")
public class SchedulerActivator {
	
	private IWorkerRegistry workerRegistry;
	
	private final SchedulerExecutor executor;
	
	public SchedulerActivator() {
		this.executor = new SchedulerExecutor();
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
