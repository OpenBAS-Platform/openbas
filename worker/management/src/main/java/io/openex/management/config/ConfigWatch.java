package io.openex.management.config;

import io.openex.management.Executor;
import io.openex.management.IOpenexContext;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.*;

import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;
import static java.nio.file.StandardWatchEventKinds.OVERFLOW;

@SuppressWarnings("PackageAccessibility")
public class ConfigWatch extends Thread {
	private static Logger logger = LoggerFactory.getLogger(ConfigWatch.class);
	
	private IOpenexContext openexContext;
	
	public ConfigWatch(IOpenexContext openexContext) {
		this.openexContext = openexContext;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public void run() {
		logger.info("ConfigWatcher [STARTING]");
		try {
			WatchService watchService = FileSystems.getDefault().newWatchService();
			Path path = Paths.get(System.getProperty("karaf.home") + "/openex/");
			path.register(watchService, ENTRY_MODIFY);
			for (; ; ) {
				// wait for key to be signaled
				WatchKey key;
				try {
					key = watchService.take();
				} catch (InterruptedException x) {
					return;
				}
				
				for (WatchEvent<?> event : key.pollEvents()) {
					WatchEvent.Kind<?> kind = event.kind();
					if (kind == OVERFLOW) {
						continue;
					}
					
					WatchEvent<Path> ev = (WatchEvent<Path>) event;
					Path filename = ev.context();
					String workerId = FilenameUtils.removeExtension(filename.toFile().getName());
					Executor executor = openexContext.getWorkerRegistry().workers().get(workerId);
					logger.info("ConfigWatcher [Refresh " + workerId + "]");
					openexContext.refreshCamelModule(executor);
				}
				
				// Reset the key -- this step is critical if you want to
				// receive further watch events.  If the key is no longer valid,
				// the directory is inaccessible so exit the loop.
				boolean valid = key.reset();
				if (!valid) {
					break;
				}
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}
