package io.openex.email.attachment;

import org.apache.camel.Exchange;
import org.apache.camel.Message;
import org.apache.commons.io.IOUtils;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by Julien on 19/12/2016.
 */
@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class EmailDownloader {
	
	public static final String AUTHORIZATION = "Authorization";
	public static final String FILE_NAME = "file_name";
	public static final String FILE_URL = "file_url";
	public static final String ATTACHMENTS = "attachments";
	public static final String ATTACHMENTS_CONTENT = "attachments_content";
	
	@SuppressWarnings({"unused", "unchecked"})
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		List attachments = in.getHeader(ATTACHMENTS, List.class);
		if (attachments != null) {
			List<EmailAttachment> filesContent = (List) exchange.getProperty(ATTACHMENTS_CONTENT, new ArrayList<>());
			for (Object attachment : attachments) {
				Map attachmentMap = (Map) attachment;
				String file_name = attachmentMap.get(FILE_NAME).toString();
				String file_url = attachmentMap.get(FILE_URL).toString();
				try {
					String openexToken = in.getHeader(AUTHORIZATION, String.class);
					HttpURLConnection urlConnection = (HttpURLConnection) new URL(file_url).openConnection();
					urlConnection.setRequestProperty(AUTHORIZATION, openexToken);
					byte[] content = IOUtils.toByteArray(urlConnection.getInputStream());
					filesContent.add(new EmailAttachment(file_name, content, urlConnection.getContentType()));
					
				} catch (Exception e) {
					throw new RuntimeException(e);
				}
			}
			exchange.setProperty(ATTACHMENTS_CONTENT, filesContent);
		}
	}
}
