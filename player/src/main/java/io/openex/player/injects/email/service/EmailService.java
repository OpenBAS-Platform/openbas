package io.openex.player.injects.email.service;

import freemarker.template.Configuration;
import freemarker.template.Template;
import io.openex.player.config.OpenExConfig;
import io.openex.player.injects.email.model.EmailAttachment;
import io.openex.player.injects.email.model.EmailInjectAttachment;
import io.openex.player.model.audience.User;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.util.StringUtils;

import javax.mail.internet.MimeMessage;
import javax.mail.util.ByteArrayDataSource;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static io.openex.player.utils.HttpCaller.AUTHORIZATION;

@Component
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private EmailPgp emailPgp;

    @Autowired
    private OpenExConfig config;

    public List<EmailAttachment> resolveAttachments(List<EmailInjectAttachment> attachments) throws Exception {
        List<EmailAttachment> resolved = new ArrayList<>();
        for (EmailInjectAttachment attachment : attachments) {
            String file_id = attachment.getId();
            String file_name = attachment.getName();
            String attachmentUri = config.getApi() + config.getAttachmentUri();
            URL attachmentURL = new URL(attachmentUri + "/" + file_id);
            HttpURLConnection urlConnection = (HttpURLConnection) attachmentURL.openConnection();
            urlConnection.setRequestProperty(AUTHORIZATION, config.getToken());
            byte[] content = IOUtils.toByteArray(urlConnection.getInputStream());
            resolved.add(new EmailAttachment(file_name, content, urlConnection.getContentType()));
        }
        return resolved;
    }

    public void sendMessage(User user, String from, String subject, String content, List<EmailAttachment> attachments) throws Exception {
        System.out.println("Sending mail to " + user.getEmail());
        Map<String, Object> model = user.toMarkerMap();
        Template template = new Template("email", new StringReader(content), new Configuration(Configuration.VERSION_2_3_30));
        String body = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(user.getEmail());
        helper.setSubject(subject);
        boolean needEncrypt = !StringUtils.isEmpty(user.getPgpKey());
        helper.setText(needEncrypt ? emailPgp.encryptText(user, body) : body, true);
        List<EmailAttachment> attachmentsToSent = needEncrypt ? emailPgp.encryptAttachments(user, attachments) : attachments;
        for (EmailAttachment attachment : attachmentsToSent) {
            ByteArrayDataSource bds = new ByteArrayDataSource(attachment.getData(), attachment.getContentType());
            helper.addAttachment(attachment.getName(), bds);
        }
        emailSender.send(message);
    }
}
