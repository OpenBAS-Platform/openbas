package io.openex.management.helper;

import org.apache.camel.Exchange;
import org.apache.camel.Message;

import java.io.FileInputStream;
import java.util.Properties;

/**
 * Created by Julien on 13/03/2017.
 */
public class OpenexPropertyUtils {
	
	public static boolean isWorkerEnable(String workerId) {
		Properties prop = new Properties();
		try {
			prop.load(new FileInputStream(System.getProperty("karaf.home") + "/openex/" + workerId + ".properties"));
			return prop.getProperty(workerId + ".enable").equalsIgnoreCase("true");
		} catch (Exception e) {
			return false;
		}
	}
	
	@SuppressWarnings("PackageAccessibility")
	static long computeExecutionDuration(Exchange exchange) {
		long startTime = exchange.getProperty(Exchange.CREATED_TIMESTAMP, Long.class);
		return System.currentTimeMillis() - startTime;
	}
}
