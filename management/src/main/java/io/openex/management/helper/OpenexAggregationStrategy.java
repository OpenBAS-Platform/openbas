package io.openex.management.helper;

import com.google.gson.GsonBuilder;
import org.apache.camel.Exchange;
import org.apache.camel.processor.aggregate.GroupedExchangeAggregationStrategy;

import java.util.List;
import java.util.stream.Collectors;

import static com.google.common.base.Throwables.getRootCause;
import static java.util.Collections.singletonList;

@SuppressWarnings({"PackageAccessibility", "ThrowableResultOfMethodCallIgnored"})
public class OpenexAggregationStrategy extends GroupedExchangeAggregationStrategy {
	
	private static final String STATUS_PARTIAL = "PARTIAL";
	private static final String STATUS_ERROR = "ERROR";
	private static final String STATUS_SUCCESS = "SUCCESS";
	
	@SuppressWarnings("unused")
	private class ApiCallback {
		private String status;
		private List<String> message;
		
		ApiCallback(String status, List<String> message) {
			this.status = status;
			this.message = message;
		}
		
		String toJson() {
			GsonBuilder builder = new GsonBuilder();
			return builder.create().toJson(this);
		}
	}
	
	@Override
	@SuppressWarnings("unchecked")
	public void onCompletion(Exchange exchange) {
		ApiCallback callback;
		List<Exchange> list = (List<Exchange>) exchange.removeProperty(Exchange.GROUPED_EXCHANGE);
		if (list != null) {
			long errorsNumber = list.stream().filter(o -> o.getException() != null).count();
			boolean hasError = errorsNumber > 0;
			List<String> message = list.stream()
					.map(o -> o.getException() != null ? getRootCause(o.getException()).getMessage() :
							String.valueOf(o.getIn().getBody()))
					.collect(Collectors.toList());
			long totalMessagesNumber = message.size();
			boolean isPartial = errorsNumber > 0 && errorsNumber != totalMessagesNumber;
			String status = isPartial ? STATUS_PARTIAL : (hasError ? STATUS_ERROR : STATUS_SUCCESS);
			callback = new ApiCallback(status, message);
		} else {
			callback = new ApiCallback(STATUS_ERROR, singletonList("Nothing to execute?"));
		}
		//Return the callback object
		exchange.getIn().setBody(callback.toJson());
	}
}
