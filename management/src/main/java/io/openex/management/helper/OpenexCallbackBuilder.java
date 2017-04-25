package io.openex.management.helper;

import org.apache.camel.Exchange;
import org.apache.camel.Message;

import static io.openex.management.helper.OpenexCallbackMessage.STATUS_ERROR;
import static io.openex.management.helper.OpenexCallbackMessage.STATUS_PENDING;
import static io.openex.management.helper.OpenexCallbackMessage.STATUS_SUCCESS;
import static java.util.Collections.singletonList;

@SuppressWarnings({"PackageAccessibility", "unused", "unchecked"})
public class OpenexCallbackBuilder {
	
	public void success(Exchange exchange) {
		buildMessage(exchange, STATUS_SUCCESS);
	}
	
	public void error(Exchange exchange) {
		buildMessage(exchange, STATUS_ERROR);
	}
	
	public void pending(Exchange exchange) {
		buildMessage(exchange, STATUS_PENDING);
	}
	
	private void buildMessage(Exchange exchange, String status) {
		long executionDuration = OpenexPropertyUtils.computeExecutionDuration(exchange);
		Message in = exchange.getIn();
		String currentBody = in.getBody().toString();
		OpenexCallbackMessage openexCallbackMessage = //
				new OpenexCallbackMessage(status, executionDuration, singletonList(currentBody));
		in.setBody(openexCallbackMessage.toJson());
	}
}