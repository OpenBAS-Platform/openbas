package io.openex.management.registry;

import io.openex.management.Executor;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("PackageAccessibility")
@Component(name = "workerRegistry", service = IWorkerRegistry.class)
public class WorkerRegistry implements IWorkerRegistry {
	
	private Map<String, IWorkerListener> listeners = new ConcurrentHashMap<>();
	private Map<String, Executor> workers = new ConcurrentHashMap<>();
	
	@Activate
	private void starter() throws Exception {
		System.out.println("START [workerRegistry]");
	}
	
	@Deactivate
	private void stop() throws Exception {
		System.out.println("STOP [workerRegistry]");
	}
	
	@Override
	public void addWorker(Executor executor) throws Exception {
		workers.put(executor.name(), executor);
		for (IWorkerListener listener : listeners.values()) {
			listener.onWorkerAdded(executor);
		}
	}
	
	@Override
	public void removeWorker(Executor executor) throws Exception {
		workers.remove(executor.name());
		for (IWorkerListener listener : listeners.values()) {
			listener.onWorkerRemoved(executor);
		}
	}
	
	@Override
	public void addListener(String id, IWorkerListener listener) {
		if(!listeners.containsKey(id)) {
			System.out.println("LISTENER ADD [" + id + "]");
			listeners.put(id, listener);
		}
	}
	
	@Override
	public void removeLister(String id) {
		if(listeners.containsKey(id)) {
			System.out.println("LISTENER REMOVE [" + id + "]");
			listeners.remove(id);
		}
	}
	
	@Override
	public Map<String, Executor> workers() {
		return workers;
	}
}
