package io.openex.player.injects.email;

import freemarker.template.Configuration;
import freemarker.template.Template;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.StringReader;
import java.util.Map;

@Component
public class MailService {

    private final String NOREPLY_ADDRESS = "noreply@openex.io";

    @Autowired
    private JavaMailSender emailSender;

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(NOREPLY_ADDRESS);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            // FileSystemResource file = new FileSystemResource(new File(pathToAttachment));
            //helper.addAttachment("Invoice", file);
            emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    public void sendMessage(String to, String subject, String content, Map<String, Object> model) throws Exception {
        Template template = new Template("email", new StringReader(content), new Configuration(Configuration.VERSION_2_3_30));
        String htmlBody = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
        sendSimpleMessage(to, subject, htmlBody);
    }
}
