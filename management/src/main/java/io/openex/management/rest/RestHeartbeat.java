package io.openex.management.rest;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@SuppressWarnings("ALL")
@XmlRootElement(name = "heartbeat")
public class RestHeartbeat {
	
	private String executor_status = "running";
	
	private long executor_memory_total = Runtime.getRuntime().totalMemory() / 1024 / 1024;
	
	private long executor_memory_free = Runtime.getRuntime().freeMemory() / 1024 / 1024;
	
	private long executor_memory_usage = executor_memory_total - executor_memory_free;
	
	private int executor_workers_number;
	
	public RestHeartbeat() {
	}
	
	public RestHeartbeat(int executor_workers_number) {
		this.executor_workers_number = executor_workers_number;
	}
	
	@XmlElement(name = "executor_status")
	public String getExecutor_status() {
		return executor_status;
	}
	
	@XmlElement(name = "executor_memory_total")
	public String getExecutorMemoryTotal() {
		return executor_memory_total + "MO";
	}
	
	@XmlElement(name = "executor_memory_free")
	public String getExecutor_memory_free() {
		return executor_memory_free + "MO";
	}
	
	@XmlElement(name = "executor_memory_usage")
	public String getExecutor_memory_usage() {
		return executor_memory_usage + "MO";
	}
	
	@XmlElement(name = "executor_workers_number")
	public int getExecutor_workers_number() {
		return executor_workers_number;
	}
}
