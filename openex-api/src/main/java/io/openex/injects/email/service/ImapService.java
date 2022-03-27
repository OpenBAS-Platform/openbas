package io.openex.injects.email.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;

@Service
public class ImapService {

    private static final Logger LOGGER = Logger.getLogger(ImapService.class.getName());
    private final static String PROVIDER = "imap";
    private Map<String, Integer> boxStates;
    private Store imapStore;

    @Value("${openex.mail.imap.enabled}")
    private boolean enabled;

    @Value("${openex.mail.imap.inbox}")
    private List<String> inboxFolders;

    @Value("${openex.mail.imap.sent}")
    private String sentFolder;

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    public ImapService(Environment env) throws Exception {
        initStore(env);
    }

    private void initStore(Environment env) throws Exception {
        boxStates = new HashMap<>();
        Session session = Session.getDefaultInstance(buildProperties(env), null);
        imapStore = session.getStore(PROVIDER);
        String host = env.getProperty("spring.mail.host");
        String username = env.getProperty("spring.mail.username");
        String password = env.getProperty("spring.mail.password");
        boolean isEnabled = env.getProperty("openex.mail.imap.enabled", Boolean.class, false);
        if (isEnabled) {
            LOGGER.log(Level.INFO, "IMAP sync started");
            imapStore.connect(host, username, password);
        } else {
            LOGGER.log(Level.INFO, "IMAP sync disabled");
        }
    }

    private String getTextFromMimeMultipart(MimeMultipart mimeMultipart) throws MessagingException, IOException {
        String result = "";
        int count = mimeMultipart.getCount();
        for (int i = 0; i < count; i++) {
            BodyPart bodyPart = mimeMultipart.getBodyPart(i);
            if (bodyPart.isMimeType("text/plain")) {
                result = result + "\n" + bodyPart.getContent();
                break; // without break same text appears twice in my tests
            } else if (bodyPart.isMimeType("text/html")) {
                String html = (String) bodyPart.getContent();
                // result = result + "\n" + org.jsoup.Jsoup.parse(html).text();
                result = html;
            } else if (bodyPart.getContent() instanceof MimeMultipart) {
                result = result + getTextFromMimeMultipart((MimeMultipart) bodyPart.getContent());
            }
        }
        return result;
    }

    private String getTextFromMessage(Message message) throws MessagingException, IOException {
        String result = "";
        if (message.isMimeType("text/plain")) {
            result = message.getContent().toString();
        } else if (message.isMimeType("multipart/*")) {
            MimeMultipart mimeMultipart = (MimeMultipart) message.getContent();
            result = getTextFromMimeMultipart(mimeMultipart);
        }
        return result;
    }

    private Properties buildProperties(Environment env) {
        String sslEnable = env.getProperty("spring.mail.properties.mail.smtp.ssl.enable");
        String sslTrust = env.getProperty("spring.mail.properties.mail.smtp.ssl.trust");
        String sslAuth = env.getProperty("spring.mail.properties.mail.smtp.auth");
        String sslStartTLS = env.getProperty("spring.mail.properties.mail.smtp.starttls.enable");
        Properties props = new Properties();
        props.setProperty("mail.smtp.ssl.enable", sslEnable);
        props.setProperty("mail.smtp.ssl.trust", sslTrust);
        props.setProperty("mail.smtp.auth", sslAuth);
        props.setProperty("mail.smtp.starttls.enable", sslStartTLS);
        return props;
    }

    private List<String> computeParticipants(Message message) throws Exception {
        List<String> from = Arrays.stream(message.getFrom())
                .map(addr -> (((InternetAddress) addr).getAddress())).toList();
        List<String> recipients = Arrays.stream(message.getAllRecipients())
                .map(addr -> (((InternetAddress) addr).getAddress())).toList();
        return Stream.concat(from.stream(), recipients.stream()).distinct().toList();
    }

    private void parseMessages(String box, Message[] messages) throws Exception {
        for (Message message : messages) {
            List<String> participants = computeParticipants(message);
            String subject = message.getSubject();
            int lastMessageNumber = message.getMessageNumber();
            Date receivedDate = message.getReceivedDate();
            Date sentDate = message.getSentDate();
            String content = getTextFromMessage(message);
            System.out.println(participants + " = " + subject + " (receivedDate=" + receivedDate + " | messageNumber=" + lastMessageNumber + ")");
            boxStates.put(box, lastMessageNumber);
        }
    }

    private void synchronizeBox(Folder inbox) throws Exception {
        // Date syncExecution = new Date(); // DateUtils.addDays(new Date(), -1);
        Integer startMessageNumber = boxStates.get(inbox.getName());
        int messageCount = inbox.getMessageCount();
        if (startMessageNumber == null) {
            startMessageNumber = messageCount;
        }
        if (startMessageNumber < messageCount) {
            System.out.println("synchronizeInbox " + inbox.getName() + " from " + startMessageNumber + " to " + messageCount);
            Message[] messages = inbox.getMessages(startMessageNumber + 1, messageCount);
            System.out.println("Find " + messages.length);
            if (messages.length > 0) {
                parseMessages(inbox.getName(), messages);
            }
        }
        boxStates.put(inbox.getName(), messageCount);
    }

    private void syncFolders() throws Exception {
        // Sync sent
        Folder sentBox = imapStore.getFolder(sentFolder);
        sentBox.open(Folder.READ_ONLY);
        synchronizeBox(sentBox);
        // Sync received
        for (String listeningFolder : inboxFolders) {
            Folder inbox = imapStore.getFolder(listeningFolder);
            inbox.open(Folder.READ_ONLY);
            synchronizeBox(inbox);
        }
    }

    // Sync folders every 10 sec
    @Scheduled(fixedDelay = 10000, initialDelay = 10000)
    public void connectionListener() throws Exception {
        if (enabled) {
            LOGGER.log(Level.INFO, "IMAP sync round trip at " + new Date());
            if (!imapStore.isConnected()) {
                imapStore.connect(host, username, password);
            }
            syncFolders();
        }
    }

    public void storeSentMessage(MimeMessage message) throws Exception {
        Folder folder = imapStore.getFolder(sentFolder);
        folder.open(Folder.READ_WRITE);
        message.setFlag(Flags.Flag.SEEN, true);
        folder.appendMessages(new Message[]{message});
        folder.close();
    }
}
