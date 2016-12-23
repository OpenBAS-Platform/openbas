package io.openex.email.attachment;

import org.apache.camel.Exchange;

import javax.activation.DataHandler;
import javax.mail.util.ByteArrayDataSource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.openex.email.attachment.EmailDownloader.ATTACHMENTS_CONTENT;

/**
 * Created by Julien on 19/12/2016.
 */
@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class EmailAttacher {
	
	@SuppressWarnings({"unused", "unchecked"})
	public void process(Exchange exchange) {
		List<EmailAttachment> filesContent = (List) exchange.getProperty(ATTACHMENTS_CONTENT, new ArrayList<>());
		for (EmailAttachment attachment : filesContent) {
			ByteArrayDataSource bds = new ByteArrayDataSource(attachment.getData(), attachment.getContentType());
			exchange.getIn().addAttachment(attachment.getName(), new DataHandler(bds));
		}
	}
}
