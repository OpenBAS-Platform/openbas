package io.openbas.authorisation;

import io.openbas.config.OpenBASConfig;
import jakarta.annotation.Resource;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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

  /** Get files paths ".pem" from directory */
  private Set<String> getFilesPaths(String dir) {
    try (Stream<Path> stream = Files.list(Paths.get(dir))) {
      return stream
          .filter(file -> !Files.isDirectory(file))
          .map(path -> path.toAbsolutePath().normalize())
          .map(Path::toString)
          .filter(path -> path.endsWith(".pem"))
          .collect(Collectors.toSet());
    } catch (Exception e) {
      log.info("No extra trusted certificate found in " + dir);
      return new HashSet<>();
    }
  }

  /** Get extra trusted certs from files */
  private List<X509Certificate> getExtraCerts(Set<String> filesPaths)
      throws IOException, CertificateException {
    List<X509Certificate> extraCerts = new ArrayList<>();
    for (String filePath : filesPaths) {
      try (FileInputStream myKey = new FileInputStream(filePath)) {
        CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
        try {
          X509Certificate cert = (X509Certificate) certFactory.generateCertificate(myKey);
          Pattern pattern = Pattern.compile("CN=([^,]+)");
          Matcher matcher = pattern.matcher(cert.getSubjectX500Principal().getName());
          String name = matcher.find() ? matcher.group(1) : filePath;
          if (!extraCerts.contains(cert)) {
            cert.checkValidity();
            extraCerts.add(cert);
            log.info("Added extra trusted certificate: {}", name);
          } else {
            log.info("Extra trusted certificate duplicated: {}", name);
          }
        } catch (CertificateException e) {
          log.error("Extra trusted certificate {} is not a valid PEM certificate", filePath, e);
        }
      }
    }
    return extraCerts;
  }

  /**
   * Get and set extra trusted certificates to the java trust manager
   *
   * @return tls context with our extra trusted certificates
   * @throws Exception exception
   */
  @Bean
  public X509TrustManager tlsContextCustom() throws Exception {
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

    Set<String> filesPaths = getFilesPaths(openBASConfig.getExtraTrustedCertsDir());

    List<X509Certificate> extraCerts = getExtraCerts(filesPaths);

    X509TrustManager finalDefaultTm = defaultX509CertificateTrustManager;

    X509TrustManager wrapper =
        new X509TrustManager() {
          private X509Certificate[] mergeCertificates() {
            ArrayList<X509Certificate> resultingCerts = new ArrayList<>();
            resultingCerts.addAll(Arrays.asList(finalDefaultTm.getAcceptedIssuers()));
            resultingCerts.addAll(extraCerts);
            return resultingCerts.toArray(new X509Certificate[resultingCerts.size()]);
          }

          @Override
          public X509Certificate[] getAcceptedIssuers() {
            return mergeCertificates();
          }

          @Override
          public void checkServerTrusted(X509Certificate[] chain, String authType) {
            try {
              finalDefaultTm.checkServerTrusted(chain, authType);
            } catch (CertificateException e) {
              log.error("Error occurred during checkServerTrusted", e);
            }
          }

          @Override
          public void checkClientTrusted(X509Certificate[] chain, String authType)
              throws CertificateException {
            finalDefaultTm.checkClientTrusted(mergeCertificates(), authType);
          }
        };

    return wrapper;
  }
}
