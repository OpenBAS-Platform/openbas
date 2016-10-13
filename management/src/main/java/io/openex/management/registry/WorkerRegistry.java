package io.openex.management.registry;

import io.openex.management.Executor;

import java.util.Map;

/**
 * Created by Julien on 13/10/2016.
 */
public interface WorkerRegistry {
	void addWorker(Executor executor);
	
	void removeWorker(Executor executor);
	
	Map<String, Executor> workers();
}
