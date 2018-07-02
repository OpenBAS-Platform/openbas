package io.openex.management.registry;

import io.openex.management.Executor;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings({"PackageAccessibility", "unused"})
@Component(name = "workerRegistry", service = IWorkerRegistry.class)
public class WorkerRegistry implements IWorkerRegistry {
	private static Logger logger = LoggerFactory.getLogger(WorkerRegistry.class);
	private Map<String, IWorkerListener> listeners = new ConcurrentHashMap<>();
	private Map<String, Executor> workers = new ConcurrentHashMap<>();
	
	@Activate
	private void starter() throws Exception {
		logger.info("Starting [workerRegistry]");
	}
	
	@Deactivate
	private void stop() throws Exception {
		logger.info("Stopping [workerRegistry]");
	}
	
	@Override
	public void addWorker(Executor executor) throws Exception {
		workers.put(executor.id(), executor);
		for (IWorkerListener listener : listeners.values()) {
			listener.onWorkerAdded(executor);
		}
	}
	
	@Override
	public void removeWorker(Executor executor) throws Exception {
		workers.remove(executor.id());
		for (IWorkerListener listener : listeners.values()) {
			listener.onWorkerRemoved(executor);
		}
	}
	
	@Override
	public void addListener(String id, IWorkerListener listener) {
		if (!listeners.containsKey(id)) {
			logger.info("Adding listener  [" + id + "] to the registry");
			listeners.put(id, listener);
		}
	}
	
	@Override
	public void removeLister(String id) {
		if (listeners.containsKey(id)) {
			logger.info("Removing listener [" + id + "] from the registry");
			listeners.remove(id);
		}
	}
	
	@Override
	public Map<String, Executor> workers() {
		return workers;
	}
}
