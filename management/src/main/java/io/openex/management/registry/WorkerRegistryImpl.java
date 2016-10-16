package io.openex.management.registry;

import io.openex.management.Executor;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@SuppressWarnings("PackageAccessibility")
@Component(name = "workerRegistry", service = WorkerRegistry.class)
public class WorkerRegistryImpl implements WorkerRegistry {
	
	private Map<String, WorkerListener> listeners = new ConcurrentHashMap<>();
	private Map<String, Executor> workers = new ConcurrentHashMap<>();
	
	@Activate
	private void starter() throws Exception {
		System.out.println(">>>>>>>>>>>>> workerRegistry starter");
	}
	
	@Override
	public void addWorker(Executor executor) throws Exception {
		System.out.println(">>>>>>>>> ADD worker " + executor.name());
		workers.put(executor.name(), executor);
		for (WorkerListener listener : listeners.values()) {
			listener.onWorkerAdded(executor);
		}
	}
	
	@Override
	public void removeWorker(Executor executor) throws Exception {
		System.out.println(">>>>>>>>> REMOVE worker " + executor.name());
		workers.remove(executor.name());
		for (WorkerListener listener : listeners.values()) {
			listener.onWorkerRemoved(executor);
		}
	}
	
	@Override
	public void addListener(String id, WorkerListener listener) {
		if(!listeners.containsKey(id)) {
			System.out.println(">>>>>>>>> addListener " + id);
			listeners.put(id, listener);
		}
	}
	
	@Override
	public void removeLister(String id) {
		if(listeners.containsKey(id)) {
			System.out.println(">>>>>>>>> removeLister " + id);
			listeners.remove(id);
		}
	}
	
	@Override
	public Map<String, Executor> workers() {
		return workers;
	}
}
