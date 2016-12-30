package io.openex.management.helper;

import org.apache.camel.Exchange;
import org.apache.camel.processor.aggregate.GroupedExchangeAggregationStrategy;

import java.util.List;
import java.util.stream.Collectors;

import static com.google.common.base.Throwables.getRootCause;
import static io.openex.management.helper.OpenexCallbackMessage.STATUS_PARTIAL;
import static io.openex.management.helper.OpenexCallbackMessage.STATUS_SUCCESS;
import static io.openex.management.helper.OpenexCallbackMessage.STATUS_ERROR;
import static java.util.Collections.singletonList;

@SuppressWarnings({"PackageAccessibility", "ThrowableResultOfMethodCallIgnored"})
public class OpenexAggregationStrategy extends GroupedExchangeAggregationStrategy {
	
	@Override
	@SuppressWarnings("unchecked")
	public void onCompletion(Exchange exchange) {
		if(exchange != null) { //In case of empty list in data source of aggregation
			OpenexCallbackMessage callback;
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
				callback = new OpenexCallbackMessage(status, message);
			} else {
				callback = new OpenexCallbackMessage(STATUS_ERROR, singletonList("Nothing to execute?"));
			}
			//Return the callback object
			exchange.getIn().setBody(callback.toJson());
		}
	}
}
