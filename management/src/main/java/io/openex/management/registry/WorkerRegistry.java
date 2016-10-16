package io.openex.management.registry;

import io.openex.management.Executor;

import java.util.Map;

public interface WorkerRegistry {
	void addWorker(Executor executor) throws Exception;
	
	void removeWorker(Executor executor) throws Exception;
	
	void addListener(String id, WorkerListener listener);
	
	void removeLister(String id);
	
	Map<String, Executor> workers();
}
