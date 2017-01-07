package io.openex.sms.ovh;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.camel.AsyncCallback;
import org.apache.camel.Exchange;
import org.apache.camel.Message;
import org.apache.camel.impl.DefaultAsyncProducer;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;

@SuppressWarnings({"PackageAccessibility", "WeakerAccess"})
public class OvhSmsProducer extends DefaultAsyncProducer {
	
	private static final String METHOD = "POST";
	private static final String ISO_8859_1 = "ISO-8859-1";
	public static final String UTF_8 = "UTF-8";
	
	private OvhSmsEndpoint endpoint;
	private Gson gson;
	
	public OvhSmsProducer(OvhSmsEndpoint endpoint) {
		super(endpoint);
		this.endpoint = endpoint;
		gson = new GsonBuilder().create();
	}
	
	@Override
	public boolean process(Exchange exchange, AsyncCallback callback) {
		try {
			Message in = exchange.getIn();
			String ovhSmsPhone = in.getHeader("OvhSmsPhone", String.class);
			String message = in.getBody(String.class);
			String ovhResponse = sendSms(ovhSmsPhone, message);
			in.setBody(ovhResponse);
		} catch (Exception e) {
			exchange.setException(e);
		} finally {
			callback.done(true);
		}
		return true;
	}
	
	private String sendSms(String phone, String message) throws Exception {
		
		URL QUERY = new URL("https://eu.api.ovh.com/1.0/sms/" + endpoint.getService() + "/jobs/");
		String isoMessage = new String(message.getBytes(UTF_8), ISO_8859_1);
		OvhSmsMessage ovhSmsMessage = new OvhSmsMessage(singletonList(phone), isoMessage);
		String BODY = gson.toJson(ovhSmsMessage);
		
		long Timestamp = new Date().getTime() / 1000;
		String toSign = endpoint.getAs() + "+" + endpoint.getCk() + "+" + METHOD + "+" + QUERY + "+" + BODY + "+" + Timestamp;
		String signature = "$1$" + HashSHA1(toSign);
		
		HttpURLConnection req = (HttpURLConnection) QUERY.openConnection();
		req.setRequestMethod(METHOD);
		req.setRequestProperty("Content-Type", "application/json");
		req.setRequestProperty("X-Ovh-Application", endpoint.getAk());
		req.setRequestProperty("X-Ovh-Consumer", endpoint.getCk());
		req.setRequestProperty("X-Ovh-Signature", signature);
		req.setRequestProperty("X-Ovh-Timestamp", "" + Timestamp);
		
		if (!BODY.isEmpty()) {
			req.setDoOutput(true);
			DataOutputStream wr = new DataOutputStream(req.getOutputStream());
			wr.writeBytes(BODY);
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
	
	@SuppressWarnings("UnusedAssignment")
	private String HashSHA1(String text) throws Exception {
		MessageDigest md = MessageDigest.getInstance("SHA-1");
		byte[] sha1hash = new byte[40];
		md.update(text.getBytes(), 0, text.length());
		sha1hash = md.digest();
		return convertToHex(sha1hash);
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
}
