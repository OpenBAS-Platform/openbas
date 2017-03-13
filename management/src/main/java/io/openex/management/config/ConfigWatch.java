package io.openex.management.config;

import io.openex.management.Executor;
import io.openex.management.IOpenexContext;
import org.apache.commons.io.FilenameUtils;

import java.nio.file.*;

import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;
import static java.nio.file.StandardWatchEventKinds.OVERFLOW;

@SuppressWarnings("PackageAccessibility")
public class ConfigWatch extends Thread {
	
	private IOpenexContext openexContext;
	
	public ConfigWatch(IOpenexContext openexContext) {
		this.openexContext = openexContext;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public void run() {
		System.out.println("ConfigWatcher [STARTING]");
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
					System.out.println("ConfigWatcher [Refresh " + workerId + "]");
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
