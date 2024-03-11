package io.openbas.injects.email.service;

import io.openbas.database.model.DataAttachment;
import io.openbas.database.model.Execution;
import io.openbas.execution.ExecutionContext;
import jakarta.activation.DataHandler;
import jakarta.mail.Address;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.internet.*;
import jakarta.mail.util.ByteArrayDataSource;
import org.bouncycastle.openpgp.PGPPublicKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.database.model.ExecutionTrace.traceError;
import static io.openbas.database.model.ExecutionTrace.traceSuccess;
import static io.openbas.helper.TemplateHelper.buildContextualContent;
import static java.util.stream.Collectors.joining;

@Component
public class EmailService {

    private JavaMailSender emailSender;
    private EmailPgp emailPgp;

    @Value("${openbas.mail.imap.enabled}")
    private boolean imapEnabled;

    private ImapService imapService;

    @Autowired
    public void setImapService(ImapService imapService) {
        this.imapService = imapService;
    }

    @Autowired
    public void setEmailSender(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Autowired
    public void setEmailPgp(EmailPgp emailPgp) {
        this.emailPgp = emailPgp;
    }

    public void sendEmail(Execution execution, List<ExecutionContext> usersContext, String from, String inReplyTo,
                          String subject, String message, List<DataAttachment> attachments) throws Exception {
        MimeMessage mimeMessage = buildMimeMessage(from, inReplyTo, subject, message, attachments);
        List<InternetAddress> recipients = new ArrayList<>();
        for (ExecutionContext userContext : usersContext) {
            recipients.add(new InternetAddress(userContext.getUser().getEmail()));
        }
        mimeMessage.setRecipients(Message.RecipientType.TO, recipients.toArray(InternetAddress[]::new));
        mimeMessage.setReplyTo(new Address[]{new InternetAddress(from)});
        emailSender.send(mimeMessage);

        String emails = usersContext.stream().map(c -> c.getUser().getEmail()).collect(joining(", "));
        List<String> userIds = usersContext.stream().map(c -> c.getUser().getId()).toList();
        execution.addTrace(traceSuccess("email", "Mail sent to " + emails, userIds));
        // Store message in Imap after sending
        storeMessageImap(execution, mimeMessage);
    }

    public void sendEmail(Execution execution, ExecutionContext userContext, String from, String inReplyTo,
                          boolean mustBeEncrypted, String subject, String message, List<DataAttachment> attachments)
            throws Exception {
        String email = userContext.getUser().getEmail();
        String contextualSubject = buildContextualContent(subject, userContext);
        String contextualBody = buildContextualContent(message, userContext);

        MimeMessage mimeMessage = buildMimeMessage(from, inReplyTo, contextualSubject, contextualBody, attachments);
        mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
        mimeMessage.setReplyTo(new Address[]{new InternetAddress(from)});
        // Crypt if needed
        if (mustBeEncrypted) {
            MimeMessage encMessage = getEncryptedMimeMessage(userContext, from, subject, email, mimeMessage);
            emailSender.send(encMessage);
        } else {
            emailSender.send(mimeMessage);
        }
        List<String> userIds = List.of(userContext.getUser().getId());
        execution.addTrace(traceSuccess("email", "Mail sent to " + email, userIds));
        // Store message in Imap after sending
        storeMessageImap(execution, mimeMessage);
    }

    private void storeMessageImap(Execution execution, MimeMessage mimeMessage) {
        if (execution.isRuntime() && imapEnabled) {
            for (int i = 0; i < 3; i++) {
                try {
                    imapService.storeSentMessage(mimeMessage);
                    execution.addTrace(traceSuccess("imap", "Mail successfully stored in IMAP"));
                    return;
                } catch (Exception ignored) {
                }
            }
            execution.addTrace(traceError("imap", "Fail to store mail in IMAP after 3 attempts"));
        }
    }

    private MimeMessage buildMimeMessage(String from, String inReplyTo, String subject, String body,
                                         List<DataAttachment> attachments) throws Exception {
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        mimeMessage.setFrom(from);
        if (inReplyTo != null) {
            mimeMessage.setHeader("In-Reply-To", inReplyTo);
            mimeMessage.setHeader("References", inReplyTo);
        }
        mimeMessage.setSubject(subject, "utf-8");
        Multipart mailMultipart = new MimeMultipart("mixed");
        // Add mail content
        MimeBodyPart bodyPart = new MimeBodyPart();
        bodyPart.setContent(body, "text/html;charset=utf-8");
        mailMultipart.addBodyPart(bodyPart);
        // Add Attachments
        for (DataAttachment attachment : attachments) {
            MimeBodyPart aBodyPart = new MimeBodyPart();
            aBodyPart.setFileName(attachment.name());
            aBodyPart.setHeader("Content-Type", attachment.contentType());
            ByteArrayDataSource bds = new ByteArrayDataSource(attachment.data(), attachment.contentType());
            aBodyPart.setDataHandler(new DataHandler(bds));
            mailMultipart.addBodyPart(aBodyPart);
        }
        mimeMessage.setContent(mailMultipart);
        return mimeMessage;
    }
    private MimeMessage getEncryptedMimeMessage(ExecutionContext userContext, String from, String subject, String email, MimeMessage mimeMessage) throws IOException, MessagingException {
        PGPPublicKey userPgpKey = emailPgp.getUserPgpKey(userContext.getUser());
        // Need to create another email that will wrap everything.
        MimeMessage encMessage = emailSender.createMimeMessage();
        encMessage.setFrom(from);
        encMessage.setSubject(subject, "utf-8");
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

        String encryptedEmail = emailPgp.encrypt(userPgpKey, multiEncStream.toString());

        MimeBodyPart encBodyPart = new MimeBodyPart();
        encBodyPart.setDisposition("inline");
        encBodyPart.setFileName("openpgp-encrypted-message.asc");
        encBodyPart.setContent(encryptedEmail, "application/octet-stream");
        encMultipart.addBodyPart(encBodyPart);
        // Fill the message with the multipart content
        encMessage.setContent(encMultipart);
        return encMessage;
    }
}
