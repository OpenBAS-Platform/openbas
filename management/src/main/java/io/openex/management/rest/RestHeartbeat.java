package io.openex.management.rest;

import java.util.Set;

@SuppressWarnings("WeakerAccess")
public class RestHeartbeat {

	protected String status;
	
	protected String memory_total;
	
	protected String memory_free;
	
	protected String memory_usage;
	
	protected int workers_number;
	
	protected Set<String> workers_registered;
	
	public RestHeartbeat(Set<String> workers) {
		this.status = workers.size() > 0 ? "RUNNING" : "PENDING";
		this.workers_number = workers.size();
		this.workers_registered = workers;
		long totalMemoryInMb = Runtime.getRuntime().totalMemory() / 1024 / 1024;
		this.memory_total = totalMemoryInMb + "MO";
		long freeMemoryInMb = Runtime.getRuntime().freeMemory() / 1024 / 1024;
		this.memory_free = freeMemoryInMb + "MO";
		this.memory_usage = totalMemoryInMb - freeMemoryInMb + "MO";
	}
}
