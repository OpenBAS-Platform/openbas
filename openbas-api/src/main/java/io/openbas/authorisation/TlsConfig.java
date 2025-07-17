package io.openbas.authorisation;

import io.openbas.config.OpenBASConfig;
import jakarta.annotation.Resource;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TlsConfig {

  @Resource private OpenBASConfig openBASConfig;

  private Set<String> getFileNames(String dir) {
    try (Stream<Path> stream = Files.list(Paths.get(dir))) {
      return stream
          .filter(file -> !Files.isDirectory(file))
          .map(path -> path.toAbsolutePath().normalize())
          .map(Path::toString)
          .filter(path -> path.endsWith(".p12"))
          .collect(Collectors.toSet());
    } catch (Exception e) {
      log.info("No extra trusted certificate found in " + dir);
      return new HashSet<>();
    }
  }

  @Bean
  public SSLContext tlsContextCustom() throws Exception {
    TrustManagerFactory trustManagerFactory =
        TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    trustManagerFactory.init((KeyStore) null);

    X509TrustManager defaultX509CertificateTrustManager = null;
    for (TrustManager trustManager : trustManagerFactory.getTrustManagers()) {
      if (trustManager instanceof X509TrustManager x509TrustManager) {
        defaultX509CertificateTrustManager = x509TrustManager;
        break;
      }
    }

    Set<String> certNames = getFileNames(openBASConfig.getExtraTrustedCertsDir());

    List<X509TrustManager> finalMyTms = new ArrayList<>();
    for (String certName : certNames) {
      try (FileInputStream myKey = new FileInputStream(certName)) {
        KeyStore myTrustStore = KeyStore.getInstance(KeyStore.getDefaultType());
        myTrustStore.load(myKey, "".toCharArray());
        trustManagerFactory =
            TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(myTrustStore);

        for (TrustManager tm : trustManagerFactory.getTrustManagers()) {
          if (tm instanceof X509TrustManager x509TrustManager) {
            for (X509Certificate cert : x509TrustManager.getAcceptedIssuers()) {
              Pattern pattern = Pattern.compile("CN=([^,]+)");
              Matcher matcher = pattern.matcher(cert.getSubjectX500Principal().getName());
              if (matcher.find()) {
                log.info("Found extra trusted certificate with CN " + matcher.group(1));
              }
            }
            finalMyTms.add(x509TrustManager);
            break;
          }
        }
      }
    }

    X509TrustManager finalDefaultTm = defaultX509CertificateTrustManager;

    X509TrustManager wrapper =
        new X509TrustManager() {
          private X509Certificate[] mergeCertificates() {
            ArrayList<X509Certificate> resultingCerts = new ArrayList<>();
            resultingCerts.addAll(Arrays.asList(finalDefaultTm.getAcceptedIssuers()));
            for (X509TrustManager tm : finalMyTms) {
              resultingCerts.addAll(Arrays.asList(tm.getAcceptedIssuers()));
            }
            return resultingCerts.toArray(new X509Certificate[resultingCerts.size()]);
          }

          @Override
          public X509Certificate[] getAcceptedIssuers() {
            return mergeCertificates();
          }

          @Override
          public void checkServerTrusted(X509Certificate[] chain, String authType)
              throws CertificateException {
            try {
              for (X509TrustManager tm : finalMyTms) {
                tm.checkServerTrusted(chain, authType);
              }
            } catch (CertificateException e) {
              finalDefaultTm.checkServerTrusted(chain, authType);
            }
          }

          @Override
          public void checkClientTrusted(X509Certificate[] chain, String authType)
              throws CertificateException {
            finalDefaultTm.checkClientTrusted(mergeCertificates(), authType);
          }
        };

    SSLContext context = SSLContext.getInstance("TLS");
    context.init(null, new TrustManager[] {wrapper}, null);
    return context;
  }
}
