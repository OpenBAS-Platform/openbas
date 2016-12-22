package io.openex.email;

import org.apache.camel.Exchange;
import org.apache.camel.Message;

import javax.activation.DataHandler;
import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.Map;

/**
 * Created by Julien on 19/12/2016.
 */
@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class EmailAttacher {
	
	@SuppressWarnings("unused")
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		List attachments = in.getHeader("attachments", List.class);
		if (attachments != null) {
			for (Object attachment : attachments) {
				Map attachmentMap = (Map) attachment;
				String file_name = attachmentMap.get("file_name").toString();
				String file_url = attachmentMap.get("file_url").toString();
				try {
					//TODO Add token for fetching URI
					in.addAttachment(file_name, new DataHandler(new URL(file_url)));
				} catch (IOException e) {
					throw new RuntimeException(e);
				}
			}
		}
	}
}
