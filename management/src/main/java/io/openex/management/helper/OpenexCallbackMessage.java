package io.openex.management.helper;

import com.google.gson.GsonBuilder;

import java.util.List;

/**
 * Created by Julien on 30/12/2016.
 */
@SuppressWarnings({"FieldCanBeLocal", "unused", "PackageAccessibility"})
class OpenexCallbackMessage {
	static final String STATUS_PENDING = "PENDING";
	static final String STATUS_PARTIAL = "PARTIAL";
	static final String STATUS_ERROR = "ERROR";
	static final String STATUS_SUCCESS = "SUCCESS";
	
	private String status;
	private long execution;
	private List<String> message;
	
	OpenexCallbackMessage(String status, long execution, List<String> message) {
		this.status = status;
		this.execution = execution;
		this.message = message;
	}
	
	String toJson() {
		GsonBuilder builder = new GsonBuilder();
		return builder.create().toJson(this);
	}
}
