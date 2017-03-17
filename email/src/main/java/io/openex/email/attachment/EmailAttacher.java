package io.openex.email.attachment;

import org.apache.camel.Exchange;

import javax.activation.DataHandler;
import javax.mail.internet.MimeUtility;
import javax.mail.util.ByteArrayDataSource;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

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
			String fileName = attachment.getName();
			try {
				fileName = MimeUtility.encodeText(attachment.getName(), "UTF-8", null);
			} catch (UnsupportedEncodingException e) {
				//Nothing to here, just send the email with the standard charset
			} finally {
				exchange.getIn().addAttachment(fileName, new DataHandler(bds));
			}
		}
	}
}
