package io.openex.management.registry;

import io.openex.management.Executor;

/**
 * Created by Julien on 15/10/2016.
 */
public interface WorkerListener {
	void onWorkerAdded(Executor executor) throws Exception;
	
	void onWorkerRemoved(Executor executor) throws Exception;
}
