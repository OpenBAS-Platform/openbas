package io.openex.management;

import io.openex.management.config.ConfigWatch;
import io.openex.management.helper.OpenexAggregationStrategy;
import io.openex.management.helper.OpenexCallbackBuilder;
import io.openex.management.helper.OpenexPropertyUtils;
import io.openex.management.registry.IWorkerListener;
import io.openex.management.registry.IWorkerRegistry;
import org.apache.camel.ThreadPoolRejectedPolicy;
import org.apache.camel.component.properties.PropertiesComponent;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.impl.PropertyPlaceholderDelegateRegistry;
import org.apache.camel.impl.SimpleRegistry;
import org.apache.camel.model.dataformat.JsonDataFormat;
import org.apache.camel.model.dataformat.JsonLibrary;
import org.apache.camel.spi.Registry;
import org.apache.camel.spi.ThreadPoolProfile;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Component
@SuppressWarnings({"PackageAccessibility", "unused"})
public class OpenexContext implements IOpenexContext {
	
	private static final String OPENEX_CONTEXT_KEY = "OpenexContext";
	private DefaultCamelContext context = new DefaultCamelContext();
	private IWorkerRegistry workerRegistry;
	private ConfigWatch configWatch = new ConfigWatch(this);
	
	@Activate
	private void starter() throws Exception {
		System.out.println("START [OpenexContext]");
		workerRegistry.addListener(OPENEX_CONTEXT_KEY, new IWorkerListener() {
			@Override
			public void onWorkerAdded(Executor executor) throws Exception {
				registerCamelModule(executor);
			}
			
			@Override
			public void onWorkerRemoved(Executor executor) throws Exception {
				unregisterCamelModule(executor);
			}
		});
		configWatch.start();
		createContext();
	}
	
	private void unregisterCamelModule(Executor executor) throws Exception {
		System.out.println("UnregisterCamelModule [" + executor.name() + "]");
		unregisterExecutorComponent(executor);
		context.removeRouteDefinitions(context.loadRoutesDefinition(executor.routes()).getRoutes());
	}
	
	private void registerCamelModule(Executor executor) throws Exception {
		unregisterCamelModule(executor);
		if(OpenexPropertyUtils.isWorkerEnable(executor.name())) {
			System.out.println("RegisterCamelModule [" + executor.name() + "] activated");
			registerExecutorComponent(executor);
			context.addRouteDefinitions(context.loadRoutesDefinition(executor.routes()).getRoutes());
		}
	}
	
	public void refreshCamelModule(Executor executor) throws Exception {
		refreshPropertiesComponent();
		registerCamelModule(executor);
	}
	
	@Deactivate
	public void stop() throws Exception {
		System.out.println("STOP [OpenexContext]");
		configWatch.interrupt();
		context.stop();
	}
	
	//region utils
	@SuppressWarnings("Convert2streamapi")
	private void unregisterExecutorComponent(Executor... executors) {
		for (Executor executor : executors) {
			//unregister beans
			Registry registry = context.getRegistry();
			if (registry instanceof PropertyPlaceholderDelegateRegistry) {
				registry = ((PropertyPlaceholderDelegateRegistry) registry).getRegistry();
			}
			SimpleRegistry openexRegistry = (SimpleRegistry) registry;
			Set<Map.Entry<String, Object>> beansEntries = executor.beans().entrySet();
			for (Map.Entry<String, Object> beansEntry : beansEntries) {
				if (openexRegistry.containsKey(beansEntry.getKey())) {
					openexRegistry.remove(beansEntry.getKey());
				}
			}
			//unregister components
			Set<String> keys = executor.components().keySet();
			for (String key : keys) {
				if (context.getComponentNames().contains(key)) {
					context.removeComponent(key);
				}
			}
		}
	}
	
	@SuppressWarnings("Convert2streamapi")
	private void registerExecutorComponent(Executor... executors) {
		for (Executor executor : executors) {
			//register beans
			Registry registry = context.getRegistry();
			if (registry instanceof PropertyPlaceholderDelegateRegistry) {
				registry = ((PropertyPlaceholderDelegateRegistry) registry).getRegistry();
			}
			SimpleRegistry openexRegistry = (SimpleRegistry) registry;
			Set<Map.Entry<String, Object>> beansEntries = executor.beans().entrySet();
			for (Map.Entry<String, Object> beansEntry : beansEntries) {
				if (!openexRegistry.containsKey(beansEntry.getKey())) {
					openexRegistry.put(beansEntry.getKey(), beansEntry.getValue());
				}
			}
			//register components
			Set<Map.Entry<String, org.apache.camel.Component>> components = executor.components().entrySet();
			for (Map.Entry<String, org.apache.camel.Component> entry : components) {
				if (!context.getComponentNames().contains(entry.getKey())) {
					context.addComponent(entry.getKey(), entry.getValue());
				}
			}
		}
	}
	
	private ThreadPoolProfile threadPoolProfileRemote() {
		//Define custom thread pool profile
		ThreadPoolProfile threadPoolProfile = new ThreadPoolProfile("openex-remote-thread-profile");
		threadPoolProfile.setPoolSize(10);
		threadPoolProfile.setMaxPoolSize(20);
		threadPoolProfile.setMaxQueueSize(500);
		threadPoolProfile.setAllowCoreThreadTimeOut(false);
		threadPoolProfile.setRejectedPolicy(ThreadPoolRejectedPolicy.Discard);
		return threadPoolProfile;
	}
	
	private ThreadPoolProfile threadPoolProfileExecutor() {
		//Define custom thread pool profile
		ThreadPoolProfile threadPoolProfile = new ThreadPoolProfile("openex-worker-thread-profile");
		threadPoolProfile.setPoolSize(20);
		threadPoolProfile.setMaxPoolSize(40);
		threadPoolProfile.setMaxQueueSize(1000);
		threadPoolProfile.setAllowCoreThreadTimeOut(false);
		threadPoolProfile.setRejectedPolicy(ThreadPoolRejectedPolicy.CallerRuns);
		return threadPoolProfile;
	}
	//endregion
	
	private void createContext() throws Exception {
		SimpleRegistry registry = new SimpleRegistry();
		registry.put("openexRouter", new OpenexRouter());
		registry.put("openexStrategy", new OpenexAggregationStrategy());
		registry.put("openexCallback", new OpenexCallbackBuilder());
		context.setRegistry(registry);
		context.addComponent("properties", buildPropertiesComponent());
		context.getExecutorServiceManager().registerThreadPoolProfile(threadPoolProfileRemote());
		context.getExecutorServiceManager().registerThreadPoolProfile(threadPoolProfileExecutor());
		context.setTracing(true);

		//Populate data formats
		JsonDataFormat jsonDataFormat = new JsonDataFormat(JsonLibrary.Gson);
		jsonDataFormat.setUseList(true);
		context.setDataFormats(Collections.singletonMap("json", jsonDataFormat));
		
		//Rest direct call routes
		InputStream defaultRoutesStream = getClass().getResourceAsStream("routes.xml");
		context.addRouteDefinitions(context.loadRoutesDefinition(defaultRoutesStream).getRoutes());
		
		//Dynamic routes building
		for (Executor executor : workerRegistry.workers().values()) {
			registerCamelModule(executor);
		}
		
		//Starting context
		context.start();
	}
	
	private PropertiesComponent buildPropertiesComponent() {
		File[] propertiesFiles = new File(System.getProperty("karaf.home") + "/openex/").listFiles();
		assert propertiesFiles != null;
		List<String> paths = Arrays.stream(propertiesFiles)
				.filter(file -> file.getName().endsWith(".properties"))
				.map(file -> "file:" + file.getAbsolutePath()).collect(Collectors.toList());
		String[] locations = paths.toArray(new String[paths.size()]);
		return new PropertiesComponent(locations);
	}
	
	private void refreshPropertiesComponent() {
		context.removeComponent("properties");
		context.addComponent("properties", buildPropertiesComponent());
	}
	
	public DefaultCamelContext getContext() {
		return context;
	}
	
	public IWorkerRegistry getWorkerRegistry() {
		return workerRegistry;
	}
	
	@Reference
	@SuppressWarnings("unused")
	public void setWorkerRegistry(IWorkerRegistry workerRegistry) {
		this.workerRegistry = workerRegistry;
	}
}