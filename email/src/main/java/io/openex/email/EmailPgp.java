package io.openex.email;

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
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.util.Date;
import java.util.Spliterator;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.Spliterators.spliteratorUnknownSize;

/**
 * Created by Julien on 21/12/2016.
 */
@SuppressWarnings("PackageAccessibility")
public class EmailPgp {

	@SuppressWarnings("unused")
	public void process(Exchange exchange) {
		Message in = exchange.getIn();
		String base64PgpKey = in.getHeader("PgpKey", String.class);
		if (base64PgpKey != null) {
			byte[] pgpKey = Base64.decode(base64PgpKey);
			try {
				in.setBody(encrypt(in.getBody().toString(), keyFromPgp(pgpKey)));
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		}
	}
	
	private PGPPublicKey keyFromPgp(byte[] publicKey) throws IOException {
		InputStream in = new ByteArrayInputStream(publicKey);
		in = org.bouncycastle.openpgp.PGPUtil.getDecoderStream(in);
		PGPPublicKeyRing keyRing = new JcaPGPPublicKeyRing(in);
		Spliterator<PGPPublicKey> splitIterator = spliteratorUnknownSize(keyRing.getPublicKeys(), Spliterator.ORDERED);
		Stream<PGPPublicKey> targetStream = StreamSupport.stream(splitIterator, false);
		return targetStream.filter(pgpPublicKey -> pgpPublicKey.isEncryptionKey() && !pgpPublicKey.isMasterKey())
				.findFirst().orElseThrow(() -> new IllegalArgumentException("Invalid PGP public key"));
	}
	
	private String encrypt(String clearData, PGPPublicKey encKey)
			throws IOException, PGPException, NoSuchProviderException {
		
		byte[] compressedData = compress(clearData.getBytes(), CompressionAlgorithmTags.ZIP);
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
		
		return new String(bOut.toByteArray(), Charset.forName("UTF-8"));
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
