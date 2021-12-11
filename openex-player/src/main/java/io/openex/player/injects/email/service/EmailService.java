package io.openex.player.injects.email.service;

import io.openex.player.helper.InjectHelper;
import io.openex.player.injects.email.model.EmailAttachment;
import io.openex.player.injects.email.model.EmailInjectAttachment;
import io.openex.player.model.database.File;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.execution.UserInjectContext;
import io.openex.player.repository.FileRepository;
import io.openex.player.service.FileService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.activation.DataHandler;
import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.internet.*;
import javax.mail.util.ByteArrayDataSource;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class EmailService {

    private static final Logger LOGGER = Logger.getLogger(EmailService.class.getName());
    private InjectHelper injectHelper;
    private JavaMailSender emailSender;
    private EmailPgp emailPgp;
    private FileRepository fileRepository;
    private FileService fileService;

    @Autowired
    public void setFileRepository(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @Autowired
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Autowired
    public void setEmailSender(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Autowired
    public void setEmailPgp(EmailPgp emailPgp) {
        this.emailPgp = emailPgp;
    }

    public List<EmailAttachment> resolveAttachments(Execution execution, List<EmailInjectAttachment> attachments) throws Exception {
        List<EmailAttachment> resolved = new ArrayList<>();
        for (EmailInjectAttachment attachment : attachments) {
            String fileName = attachment.getName();
            try {
                File file = fileRepository.findById(attachment.getId()).orElseThrow();
                InputStreamResource fileInputStream = fileService.getFile(file.getName());
                byte[] content = IOUtils.toByteArray(fileInputStream.getInputStream());
                resolved.add(new EmailAttachment(fileName, content, file.getType()));
            } catch (Exception e) {
                // Can't fetch the attachments, ignore
                execution.addMessage("Error getting content for " + fileName);
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
            }
        }
        return resolved;
    }

    public void sendEmail(UserInjectContext context, String from, String subject, String message, List<EmailAttachment> attachments) throws Exception {
        String email = context.getUser().getEmail();
        System.out.println("Sending mail to " + email);
        String body = injectHelper.buildContextualContent(message, context);
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        mimeMessage.setFrom(from);
        mimeMessage.setSubject(subject);
        mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
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
        mimeMessage.setContent(mailMultipart);
        // Crypt if needed
        boolean needEncrypt = StringUtils.hasLength(context.getUser().getPgpKey());
        if (needEncrypt) {
            // Need to create another email that will wrap everything.
            MimeMessage encMessage = emailSender.createMimeMessage();
            encMessage.setFrom(from);
            encMessage.setSubject(subject);
            encMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
            Multipart encMultipart = new MimeMultipart("encrypted; protocol=\"application/pgp-encrypted\"");
            // This is an OpenPGP/MIME encrypted message (RFC 4880 and 3156)
            InternetHeaders headers = new InternetHeaders();
            headers.addHeader("Content-Type", "application/pgp-encrypted");
            MimeBodyPart mimeExPart = new MimeBodyPart(headers, "Version: 1".getBytes());
            mimeExPart.setDescription("PGP/MIME version identification");
            encMultipart.addBodyPart(mimeExPart);
            // Export and crypt to basic email
            ByteArrayOutputStream multiEncStream = new ByteArrayOutputStream();
            mimeMessage.writeTo(multiEncStream);
            String encryptedEmail = emailPgp.encryptText(context.getUser(), multiEncStream.toString());
            MimeBodyPart encBodyPart = new MimeBodyPart();
            encBodyPart.setDisposition("inline");
            encBodyPart.setFileName("openpgp-encrypted-message.asc");
            encBodyPart.setContent(encryptedEmail, "application/octet-stream");
            encMultipart.addBodyPart(encBodyPart);
            // Fill the message with the multipart content
            encMessage.setContent(encMultipart);
            emailSender.send(encMessage);
        } else {
            emailSender.send(mimeMessage);
        }
    }
}
