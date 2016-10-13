package io.openex.management.registry;

import io.openex.management.Executor;
import org.osgi.service.component.annotations.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component(name = "workerRegistry", service = WorkerRegistry.class)
@SuppressWarnings("PackageAccessibility")
public class WorkerRegistryImpl implements WorkerRegistry {
	
	private Map<String, Executor> workers = new ConcurrentHashMap<>();
	
	@Override
	public void addWorker(Executor executor) {
		System.out.println(">>>>>>>>> ADD worker " + executor.name());
		workers.put(executor.name(), executor);
	}
	
	@Override
	public void removeWorker(Executor executor) {
		System.out.println(">>>>>>>>> REMOVE worker " + executor.name());
		workers.remove(executor.name());
	}
	
	@Override
	public Map<String, Executor> workers() {
		return workers;
	}
}
