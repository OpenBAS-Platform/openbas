package io.openex.player.injects.ovh_sms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.helper.InjectHelper;
import io.openex.player.injects.ovh_sms.config.OvhSmsConfig;
import io.openex.player.model.execution.UserInjectContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;

import static java.util.Collections.singletonList;

@Component
public class OvhSmsService {

    @Resource
    private ObjectMapper mapper;
    private static final String METHOD = "POST";
    private OvhSmsConfig config;
    private InjectHelper injectHelper;

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Autowired
    public void setConfig(OvhSmsConfig config) {
        this.config = config;
    }

    public String sendSms(UserInjectContext context, String phone, String message) throws Exception {
        String userEmail = context.getUser().getEmail();
        System.out.println("Sending sms to " + userEmail + " - " + phone);
        String smsMessage = injectHelper.buildContextualContent(message, context);
        URL QUERY = new URL("https://eu.api.ovh.com/1.0/sms/" + config.getService() + "/jobs");
        String isoMessage = new String(smsMessage.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1);
        OvhSmsMessage ovhSmsMessage = new OvhSmsMessage(singletonList(phone), isoMessage);
        String smsBody = mapper.writeValueAsString(ovhSmsMessage);

        long Timestamp = new Date().getTime() / 1000;
        String toSign = config.getAs() + "+" + config.getCk() + "+" + METHOD + "+" + QUERY + "+" + smsBody + "+" + Timestamp;
        String signature = "$1$" + HashSHA1(toSign);

        HttpURLConnection req = (HttpURLConnection) QUERY.openConnection();
        req.setRequestMethod(METHOD);
        req.setRequestProperty("Content-Type", "application/json");
        req.setRequestProperty("X-Ovh-Application", config.getAk());
        req.setRequestProperty("X-Ovh-Consumer", config.getCk());
        req.setRequestProperty("X-Ovh-Signature", signature);
        req.setRequestProperty("X-Ovh-Timestamp", "" + Timestamp);

        if (!smsBody.isEmpty()) {
            req.setDoOutput(true);
            DataOutputStream wr = new DataOutputStream(req.getOutputStream());
            wr.writeBytes(smsBody);
            wr.flush();
            wr.close();
        }

        String inputLine;
        BufferedReader in;
        int responseCode = req.getResponseCode();
        if (responseCode == 200) {
            in = new BufferedReader(new InputStreamReader(req.getInputStream()));
        } else {
            in = new BufferedReader(new InputStreamReader(req.getErrorStream()));
        }
        StringBuilder response = new StringBuilder();
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        String ovhResponse = response.toString();
        if (responseCode != 200) {
            throw new Exception(ovhResponse);
        }
        return ovhResponse;
    }

    @SuppressWarnings({"StringBufferMayBeStringBuilder", "ForLoopReplaceableByForEach"})
    private static String convertToHex(byte[] data) {
        StringBuffer buf = new StringBuffer();
        for (int i = 0; i < data.length; i++) {
            int halfbyte = (data[i] >>> 4) & 0x0F;
            int two_halfs = 0;
            do {
                if ((0 <= halfbyte) && (halfbyte <= 9))
                    buf.append((char) ('0' + halfbyte));
                else
                    buf.append((char) ('a' + (halfbyte - 10)));
                halfbyte = data[i] & 0x0F;
            } while (two_halfs++ < 1);
        }
        return buf.toString();
    }

    @SuppressWarnings("UnusedAssignment")
    private String HashSHA1(String text) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] sha1hash = new byte[40];
        md.update(text.getBytes(StandardCharsets.ISO_8859_1), 0, text.length());
        sha1hash = md.digest();
        return convertToHex(sha1hash);
    }
}
