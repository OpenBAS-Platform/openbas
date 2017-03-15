package io.openex.email;

import com.google.common.base.Throwables;
import io.openex.email.attachment.EmailAttachment;
import org.apache.camel.Exchange;
import org.apache.camel.Message;
import org.bouncycastle.bcpg.ArmoredOutputStream;
import org.bouncycastle.bcpg.CompressionAlgorithmTags;
import org.bouncycastle.openpgp.*;
import org.bouncycastle.openpgp.jcajce.JcaPGPPublicKeyRing;
import org.bouncycastle.openpgp.operator.bc.BcPGPDataEncryptorBuilder;
import org.bouncycastle.openpgp.operator.bc.BcPublicKeyKeyEncryptionMethodGenerator;
import org.bouncycastle.util.encoders.Base64;

import java.io.*;
import java.nio.charset.Charset;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Spliterator;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openex.email.attachment.EmailDownloader.ATTACHMENTS_CONTENT;
import static java.util.Spliterators.spliteratorUnknownSize;

/**
 * Created by Julien on 21/12/2016.
 */
@SuppressWarnings("PackageAccessibility")
public class EmailPgp {
	
	private static final String GPG = ".gpg";
	
	@SuppressWarnings({"unused", "unchecked"})
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		try {
			PGPPublicKey pgpKey = pgpKeyFromExchange(exchange);
			//encode message
			in.setBody(encrypt(in.getBody().toString(), pgpKey));
			//encode attachments
			List<EmailAttachment> filesContent = (List) exchange.getProperty(ATTACHMENTS_CONTENT, new ArrayList<>());
			List<EmailAttachment> encodedFilesContent = filesContent.stream()
					.map(e -> new EmailAttachment(e.getName() + GPG, encrypt(e.getData(), pgpKey), e.getContentType()))
					.collect(Collectors.toList());
			exchange.setProperty(ATTACHMENTS_CONTENT, encodedFilesContent);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	private PGPPublicKey pgpKeyFromExchange(Exchange exchange) throws IOException {
		String user = exchange.getIn().getHeader("To", String.class);
		String base64PgpKey = exchange.getIn().getHeader("PgpKey", String.class);
		if (base64PgpKey != null) {
			byte[] pgpKey = Base64.decode(base64PgpKey);
			InputStream in = new ByteArrayInputStream(pgpKey);
			InputStream decoderStream = PGPUtil.getDecoderStream(in);
			PGPPublicKeyRing keyRing = new JcaPGPPublicKeyRing(decoderStream);
			Spliterator<PGPPublicKey> splitIterator = spliteratorUnknownSize(keyRing.getPublicKeys(), Spliterator.ORDERED);
			Stream<PGPPublicKey> targetStream = StreamSupport.stream(splitIterator, false);
			return targetStream.filter(pgpPublicKey -> pgpPublicKey.isEncryptionKey() && !pgpPublicKey.isMasterKey())
					.findFirst().orElseThrow(() -> new IllegalArgumentException(user + " error: Invalid PGP public key"));
		} else {
			throw new IllegalArgumentException(user + " error: PGP key not provided");
		}
	}
	
	private String encrypt(String clearData, PGPPublicKey encKey) {
		return new String(encrypt(clearData.getBytes(), encKey), Charset.forName("UTF-8"));
	}
	
	private byte[] encrypt(byte[] clearData, PGPPublicKey encKey) {
		try {
			byte[] compressedData = compress(clearData, CompressionAlgorithmTags.ZIP);
			ByteArrayOutputStream bOut = new ByteArrayOutputStream();
			OutputStream out = new ArmoredOutputStream(bOut);
			PGPEncryptedDataGenerator encGen = new PGPEncryptedDataGenerator(
					new BcPGPDataEncryptorBuilder(PGPEncryptedDataGenerator.CAST5)
							.setSecureRandom(new SecureRandom()));
			encGen.addMethod(new BcPublicKeyKeyEncryptionMethodGenerator(encKey));
			OutputStream encOut = encGen.open(out, compressedData.length);
			encOut.write(compressedData);
			encOut.close();
			out.close();
			return bOut.toByteArray();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	private byte[] compress(byte[] clearData, int algorithm) throws IOException {
		ByteArrayOutputStream bOut = new ByteArrayOutputStream();
		PGPCompressedDataGenerator comData = new PGPCompressedDataGenerator(algorithm);
		OutputStream cos = comData.open(bOut); // open it with the final destination
		PGPLiteralDataGenerator lData = new PGPLiteralDataGenerator();
		OutputStream pOut = lData.open(cos, // the compressed output stream
				PGPLiteralData.BINARY,
				PGPLiteralData.CONSOLE,
				clearData.length, // length of clear data
				new Date()  // current time
		);
		pOut.write(clearData);
		pOut.close();
		comData.close();
		return bOut.toByteArray();
	}
}