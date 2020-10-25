package io.openex.player.injects.email;

import io.openex.player.model.User;
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
import java.nio.charset.StandardCharsets;
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

	private String encryptMessage(User user, String message) throws IOException {
		PGPPublicKey pgpKey = userPgpKey(user);
		return encrypt(message, pgpKey);
	}

	private List<EmailAttachment> encryptAttachments(User user, List<EmailAttachment> attachments) throws IOException {
		PGPPublicKey pgpKey = userPgpKey(user);
		return attachments.stream()
				.map(e -> new EmailAttachment(e.getName() + GPG, encrypt(e.getData(), pgpKey), e.getContentType()))
				.collect(Collectors.toList());
	}
	
	private PGPPublicKey userPgpKey(User user) throws IOException {
		String userPgpKey = user.getPgpKey();
		if (userPgpKey != null) {
			byte[] pgpKey = Base64.decode(userPgpKey);
			InputStream in = new ByteArrayInputStream(pgpKey);
			InputStream decoderStream = PGPUtil.getDecoderStream(in);
			PGPPublicKeyRing keyRing = new JcaPGPPublicKeyRing(decoderStream);
			Spliterator<PGPPublicKey> splitIterator = spliteratorUnknownSize(keyRing.getPublicKeys(), Spliterator.ORDERED);
			Stream<PGPPublicKey> targetStream = StreamSupport.stream(splitIterator, false);
			return targetStream.filter(pgpPublicKey -> pgpPublicKey.isEncryptionKey() && !pgpPublicKey.isMasterKey())
					.findFirst().orElseThrow(() -> new IllegalArgumentException(user.getEmail() + " error: Invalid PGP public key"));
		} else {
			throw new IllegalArgumentException(user.getEmail() + " error: PGP key not provided");
		}
	}
	
	private String encrypt(String clearData, PGPPublicKey encKey) {
		return new String(encrypt(clearData.getBytes(), encKey), StandardCharsets.UTF_8);
	}
	
	private byte[] encrypt(byte[] clearData, PGPPublicKey encKey) {
		try {
			byte[] compressedData = compress(clearData);
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
	
	private byte[] compress(byte[] clearData) throws IOException {
		ByteArrayOutputStream bOut = new ByteArrayOutputStream();
		PGPCompressedDataGenerator comData = new PGPCompressedDataGenerator(CompressionAlgorithmTags.ZIP);
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
