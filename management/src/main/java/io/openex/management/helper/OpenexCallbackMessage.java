package io.openex.management.helper;

import com.google.gson.GsonBuilder;

import java.util.List;

/**
 * Created by Julien on 30/12/2016.
 */
@SuppressWarnings({"FieldCanBeLocal", "unused"})
class OpenexCallbackMessage {
	static final String STATUS_PARTIAL = "PARTIAL";
	static final String STATUS_ERROR = "ERROR";
	static final String STATUS_SUCCESS = "SUCCESS";
	
	private String status;
	private List<String> message;
	
	OpenexCallbackMessage(String status, List<String> message) {
		this.status = status;
		this.message = message;
	}
	
	String toJson() {
		GsonBuilder builder = new GsonBuilder();
		return builder.create().toJson(this);
	}
}
