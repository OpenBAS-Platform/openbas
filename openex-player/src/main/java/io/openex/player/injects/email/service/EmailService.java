package io.openex.player.injects.email.service;

import freemarker.template.Configuration;
import freemarker.template.Template;
import io.openex.player.config.OpenExConfig;
import io.openex.player.injects.email.model.EmailAttachment;
import io.openex.player.injects.email.model.EmailInjectAttachment;
import io.openex.player.model.audience.User;
import io.openex.player.model.execution.Execution;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.util.StringUtils;

import javax.activation.DataHandler;
import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.internet.*;
import javax.mail.util.ByteArrayDataSource;
import java.io.ByteArrayOutputStream;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import static io.openex.player.utils.HttpCaller.AUTHORIZATION;

@Component
public class EmailService {

    private static final Logger LOGGER = Logger.getLogger(EmailService.class.getName());
    private final int DOWNLOAD_TIMEOUT = 2000;

    private JavaMailSender emailSender;
    private EmailPgp emailPgp;
    private OpenExConfig config;

    @Autowired
    public void setEmailSender(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Autowired
    public void setEmailPgp(EmailPgp emailPgp) {
        this.emailPgp = emailPgp;
    }

    @Autowired
    public void setConfig(OpenExConfig config) {
        this.config = config;
    }

    public List<EmailAttachment> resolveAttachments(Execution execution, List<EmailInjectAttachment> attachments) throws Exception {
        List<EmailAttachment> resolved = new ArrayList<>();
        for (EmailInjectAttachment attachment : attachments) {
            String file_id = attachment.getId();
            String file_name = attachment.getName();
            String attachmentUri = config.getApi() + config.getAttachmentUri();
            URL attachmentURL = new URL(attachmentUri + "/" + file_id);
            try {
                HttpURLConnection urlConnection = (HttpURLConnection) attachmentURL.openConnection();
                urlConnection.setRequestProperty(AUTHORIZATION, config.getToken());
                urlConnection.setConnectTimeout(DOWNLOAD_TIMEOUT);
                urlConnection.setReadTimeout(DOWNLOAD_TIMEOUT);
                byte[] content = IOUtils.toByteArray(urlConnection.getInputStream());
                resolved.add(new EmailAttachment(file_name, content, urlConnection.getContentType()));
            } catch (Exception e) {
                // Can't fetch the attachments, ignore
                execution.addMessage("Error getting content for " + file_name);
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
            }
        }
        return resolved;
    }

    public void sendEmail(User user, String from, String subject, String content, List<EmailAttachment> attachments) throws Exception {
        System.out.println("Sending mail to " + user.getEmail());
        Map<String, Object> model = user.toMarkerMap();
        Template template = new Template("email", new StringReader(content), new Configuration(Configuration.VERSION_2_3_30));
        String body = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
        MimeMessage message = emailSender.createMimeMessage();
        message.setFrom(from);
        message.setSubject(subject);
        message.setRecipient(Message.RecipientType.TO, new InternetAddress(user.getEmail()));
        Multipart mailMultipart = new MimeMultipart("mixed");
        // Add mail content
        MimeBodyPart bodyPart = new MimeBodyPart();
        bodyPart.setContent(body, "text/html;charset=utf-8");
        mailMultipart.addBodyPart(bodyPart);
        // Add Attachments
        for (EmailAttachment attachment : attachments) {
            MimeBodyPart aBodyPart = new MimeBodyPart();
            aBodyPart.setFileName(attachment.getName());
            aBodyPart.setHeader("Content-Type", attachment.getContentType());
            ByteArrayDataSource bds = new ByteArrayDataSource(attachment.getData(), attachment.getContentType());
            aBodyPart.setDataHandler(new DataHandler(bds));
            mailMultipart.addBodyPart(aBodyPart);
        }
        message.setContent(mailMultipart);
        // Crypt if needed
        boolean needEncrypt = !StringUtils.isEmpty(user.getPgpKey());
        if (needEncrypt) {
            // Need to create another email that will wrap everything.
            MimeMessage encMessage = emailSender.createMimeMessage();
            encMessage.setFrom(from);
            encMessage.setSubject(subject);
            encMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(user.getEmail()));
            Multipart encMultipart = new MimeMultipart("encrypted; protocol=\"application/pgp-encrypted\"");
            // This is an OpenPGP/MIME encrypted message (RFC 4880 and 3156)
            InternetHeaders headers = new InternetHeaders();
            headers.addHeader("Content-Type", "application/pgp-encrypted");
            MimeBodyPart mimeExPart = new MimeBodyPart(headers, "Version: 1".getBytes());
            mimeExPart.setDescription("PGP/MIME version identification");
            encMultipart.addBodyPart(mimeExPart);
            // Export and crypt to basic email
            ByteArrayOutputStream multiEncStream = new ByteArrayOutputStream();
            message.writeTo(multiEncStream);
            String encryptedEmail = emailPgp.encryptText(user, multiEncStream.toString());
            MimeBodyPart encBodyPart = new MimeBodyPart();
            encBodyPart.setDisposition("inline");
            encBodyPart.setFileName("openpgp-encrypted-message.asc");
            encBodyPart.setContent(encryptedEmail, "application/octet-stream");
            encMultipart.addBodyPart(encBodyPart);
            // Fill the message with the multipart content
            encMessage.setContent(encMultipart);
            emailSender.send(encMessage);
        } else {
            emailSender.send(message);
        }
    }
}
