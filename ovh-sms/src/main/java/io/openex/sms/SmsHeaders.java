package io.openex.sms;

import org.apache.camel.Exchange;
import org.apache.camel.Message;

import java.util.Map;

/**
 * Created by Julien on 06/01/2017.
 * Handle the concatenation of the header/footer in the message body
 */
@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class SmsHeaders {
	
	private static final String LINE_RETURN = "\n";
	
	@SuppressWarnings({"unused", "unchecked"})
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		Map<String, String> exchangeData = in.getBody(Map.class);
		String content_header = exchangeData.get("content_header");
		StringBuilder data = new StringBuilder();
		if(content_header != null) data.append(content_header).append(LINE_RETURN);
		data.append(exchangeData.get("body"));
		String content_footer = exchangeData.get("content_footer");
		if(content_footer != null) data.append(LINE_RETURN).append(content_footer);
		exchangeData.put("body", data.toString());
		in.setBody(exchangeData);
	}
}
