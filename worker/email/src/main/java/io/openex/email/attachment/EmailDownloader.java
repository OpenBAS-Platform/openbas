package io.openex.email.attachment;

import org.apache.camel.Exchange;
import org.apache.camel.Message;
import org.apache.camel.component.properties.PropertiesComponent;
import org.apache.commons.io.IOUtils;

import java.io.FileNotFoundException;
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
	
	public static final String AUTHORIZATION = "X-Authorization-Token";
	public static final String FILE_NAME = "file_name";
	public static final String FILE_ID = "file_id";
	public static final String ATTACHMENTS = "attachments";
	public static final String ATTACHMENTS_CONTENT = "attachments_content";
	
	@SuppressWarnings({"unused", "unchecked"})
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		List attachments = in.getHeader(ATTACHMENTS, List.class);
		if (attachments != null) {
			String user = exchange.getIn().getHeader("To", String.class);
			List<EmailAttachment> filesContent = (List) exchange.getProperty(ATTACHMENTS_CONTENT, new ArrayList<>());
			for (Object attachment : attachments) {
				try {
					Map attachmentMap = (Map) attachment;
					String file_id = attachmentMap.get(FILE_ID).toString();
					String file_name = attachmentMap.get(FILE_NAME).toString();
					PropertiesComponent p = exchange.getContext().getComponent("properties", PropertiesComponent.class);
					String attachmentUri = p.parseUri("{{openex.api}}") + p.parseUri("{{openex_email.attachment_uri}}");
					URL attachmentURL = new URL(attachmentUri + "/" + file_id);
					HttpURLConnection urlConnection = (HttpURLConnection) attachmentURL.openConnection();
					urlConnection.setRequestProperty(AUTHORIZATION, p.parseUri("{{openex.token}}"));
					byte[] content = IOUtils.toByteArray(urlConnection.getInputStream());
					filesContent.add(new EmailAttachment(file_name, content, urlConnection.getContentType()));
				} catch (FileNotFoundException fileNotFound) {
					//Don't care because file was removed after his inject configuration.
				} catch (Exception e) {
					throw new RuntimeException(user + " error: Failed to download files");
				}
			}
			exchange.setProperty(ATTACHMENTS_CONTENT, filesContent);
		}
	}
}
