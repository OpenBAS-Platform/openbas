package io.openex.email;

import org.apache.camel.Exchange;
import org.apache.camel.Message;

import java.util.Map;

/**
 * Created by Julien on 06/01/2017.
 * Handle the concatenation of the header/footer in the message body
 */
@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class EmailHeaders {
	
	private static final String HEADER_STYLE = "style=\"text-align: center; margin-bottom: 10px;\">";
	private static final String FOOTER_STYLE = "style=\"text-align: center; margin-top: 10px;\">";
	private static final String START_DIV = "<div ";
	private static final String END_DIV = "</div>";
	
	@SuppressWarnings({"unused", "unchecked"})
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		Map<String, String> exchangeData = in.getBody(Map.class);
		String content_header = exchangeData.get("content_header");
		StringBuilder data = new StringBuilder();
		if(content_header != null) {
			data.append(START_DIV).append(HEADER_STYLE).append(content_header).append(END_DIV);
		}
		data.append(exchangeData.get("body"));
		String content_footer = exchangeData.get("content_footer");
		if(content_footer != null) {
			data.append(START_DIV).append(FOOTER_STYLE).append(content_footer).append(END_DIV);
		}
		exchangeData.put("body", data.toString());
		in.setBody(exchangeData);
	}
}
