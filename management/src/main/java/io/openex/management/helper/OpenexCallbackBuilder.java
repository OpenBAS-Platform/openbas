package io.openex.management.helper;

import org.apache.camel.Exchange;

import static io.openex.management.helper.OpenexCallbackMessage.STATUS_ERROR;
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
	
	private void buildMessage(Exchange exchange, String status) {
		String currentBody = exchange.getIn().getBody().toString();
		OpenexCallbackMessage openexCallbackMessage = new OpenexCallbackMessage(status, singletonList(currentBody));
		exchange.getIn().setBody(openexCallbackMessage.toJson());
	}
}