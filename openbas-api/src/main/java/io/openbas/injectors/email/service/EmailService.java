package io.openbas.injectors.email.service;

import io.openbas.database.model.DataAttachment;
import io.openbas.database.model.Execution;
import io.openbas.execution.ExecutionContext;
import jakarta.activation.DataHandler;
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

import static io.openbas.database.model.InjectStatusExecution.*;
import static io.openbas.utils.TemplateHelper.buildContextualContent;
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


    public void sendEmail(Execution execution, List<ExecutionContext> usersContext, String from, List<String> replyTos, String inReplyTo,
                          String subject, String message, List<DataAttachment> attachments) throws Exception {
        MimeMessage mimeMessage = buildMimeMessage(from, replyTos, inReplyTo, subject, message, attachments);
        List<InternetAddress> recipients = new ArrayList<>();
        for (ExecutionContext userContext : usersContext) {
            recipients.add(new InternetAddress(userContext.getUser().getEmail()));
        }
        mimeMessage.setRecipients(Message.RecipientType.TO, recipients.toArray(InternetAddress[]::new));
        this.sendEmailWithRetry(mimeMessage);
        String emails = usersContext.stream().map(c -> c.getUser().getEmail()).collect(joining(", "));
        List<String> userIds = usersContext.stream().map(c -> c.getUser().getId()).toList();
        execution.addTrace(traceSuccess("Mail sent to " + emails, userIds));
        // Store message in Imap after sending
        storeMessageImap(execution, mimeMessage);
    }

    public void sendEmail(Execution execution, ExecutionContext userContext, String from, List<String> replyTos, String inReplyTo,
                          boolean mustBeEncrypted, String subject, String message, List<DataAttachment> attachments)
            throws Exception {
        String email = userContext.getUser().getEmail();
        String contextualSubject = buildContextualContent(subject, userContext);
        String contextualBody = buildContextualContent(message, userContext);

        MimeMessage mimeMessage = buildMimeMessage(from, replyTos, inReplyTo, contextualSubject, contextualBody, attachments);
        mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
        // Crypt if needed
        if (mustBeEncrypted) {
            MimeMessage encMessage = getEncryptedMimeMessage(userContext, from, replyTos, subject, email, mimeMessage);
            this.sendEmailWithRetry(encMessage);
        } else {
            this.sendEmailWithRetry(mimeMessage);
        }
        List<String> userIds = List.of(userContext.getUser().getId());
        execution.addTrace(traceSuccess("Mail sent to " + email, userIds));
        // Store message in Imap after sending
        storeMessageImap(execution, mimeMessage);
    }

    private InternetAddress getInternetAddress(String email){
        try {
            return new InternetAddress(email);
        } catch (AddressException e) {
            throw new IllegalArgumentException("Invalid email address: " + email, e);
        }
    }

    private void storeMessageImap(Execution execution, MimeMessage mimeMessage) throws InterruptedException {
        if (execution.isRuntime() && imapEnabled) {
            for (int i = 0; i < 3; i++) {
                try {
                    imapService.storeSentMessage(mimeMessage);
                    execution.addTrace(traceSuccess("Mail successfully stored in IMAP"));
                    return;
                } catch (Exception e) {
                    execution.addTrace(traceInfo("Fail to store mail in IMAP" + e.getMessage()));
                    Thread.sleep(2000);
                }
            }
            execution.addTrace(traceError("Fail to store mail in IMAP after 3 attempts"));
        }
    }

    private MimeMessage buildMimeMessage(String from, List<String> replyTos, String inReplyTo, String subject, String body,
                                         List<DataAttachment> attachments) throws Exception {
        MimeMessage mimeMessage = emailSender.createMimeMessage();
        mimeMessage.setFrom(from);
        mimeMessage.setReplyTo(replyTos.stream().map(this::getInternetAddress).toArray(InternetAddress[]::new));

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

    private MimeMessage getEncryptedMimeMessage(ExecutionContext userContext, String from, List<String> replyTos, String subject, String email, MimeMessage mimeMessage) throws IOException, MessagingException {
        PGPPublicKey userPgpKey = emailPgp.getUserPgpKey(userContext.getUser());
        // Need to create another email that will wrap everything.
        MimeMessage encMessage = emailSender.createMimeMessage();
        encMessage.setFrom(from);
        encMessage.setReplyTo(replyTos.stream().map(this::getInternetAddress).toArray(InternetAddress[]::new));
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

    private void sendEmailWithRetry(MimeMessage mimeMessage) throws Exception {
        for (int i = 0; i < 3; i++) {
            try {
                emailSender.send(mimeMessage);
                break;
            } catch (Exception e) {
                if( i == 2 ) {
                    throw e;
                }
                Thread.sleep(2000);
            }
        }
    }
}
