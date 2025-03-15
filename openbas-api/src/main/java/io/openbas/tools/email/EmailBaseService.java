package io.openbas.tools.email;

import io.openbas.database.model.DataAttachment;
import io.openbas.injectors.email.service.EmailPgp;
import jakarta.activation.DataHandler;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.internet.*;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import org.bouncycastle.openpgp.PGPPublicKey;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class EmailBaseService { // FIXME: find a better name, conflict with EmailService

  private final JavaMailSender emailSender;
  private final EmailPgp emailPgp;

  public void sendEmailWithRetry(MimeMessage mimeMessage, Consumer<Exception> exceptionHandler)
      throws InterruptedException {
    for (int i = 0; i < 3; i++) {
      try {
        emailSender.send(mimeMessage);
        return;
      } catch (Exception e) {
        exceptionHandler.accept(e);
        Thread.sleep(2000);
      }
    }
    throw new InterruptedException("Failed to send mail after 3 attempts");
  }

  public MimeMessage buildMimeMessage(
      String from,
      List<String> replyTos,
      String inReplyTo,
      String subject,
      String body,
      List<DataAttachment> attachments) throws MessagingException {
    MimeMessage mimeMessage = emailSender.createMimeMessage();
    mimeMessage.setFrom(from);
    mimeMessage.setReplyTo(
        replyTos.stream().map(this::getInternetAddress).toArray(InternetAddress[]::new));

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
      ByteArrayDataSource bds =
          new ByteArrayDataSource(attachment.data(), attachment.contentType());
      aBodyPart.setDataHandler(new DataHandler(bds));
      mailMultipart.addBodyPart(aBodyPart);
    }
    mimeMessage.setContent(mailMultipart);
    return mimeMessage;
  }

  public MimeMessage buildEncryptedMimeMessage(
      PGPPublicKey userPgpKey,
      String from,
      List<String> replyTos,
      String subject,
      String email,
      MimeMessage mimeMessage)
      throws IOException, MessagingException {
    // Need to create another email that will wrap everything.
    MimeMessage encMessage = emailSender.createMimeMessage();
    encMessage.setFrom(from);
    encMessage.setReplyTo(
        replyTos.stream().map(this::getInternetAddress).toArray(InternetAddress[]::new));
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

  private InternetAddress getInternetAddress(String email) {
    try {
      return new InternetAddress(email);
    } catch (AddressException e) {
      throw new IllegalArgumentException("Invalid email address: " + email, e);
    }
  }

}
