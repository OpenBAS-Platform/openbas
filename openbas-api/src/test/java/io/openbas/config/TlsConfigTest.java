package io.openbas.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

import io.openbas.IntegrationTest;
import io.openbas.authorisation.TlsConfig;
import java.io.File;
import java.security.cert.X509Certificate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;

@TestInstance(PER_CLASS)
class TlsConfigTest extends IntegrationTest {

  @Autowired private TlsConfig tlsConfig;

  private String resourcesDir;

  @BeforeAll
  void beforeAll() {
    File resourcesDirectory = new File("src/test/resources");
    resourcesDir = resourcesDirectory.getAbsolutePath();
  }

  @Test
  @DisplayName("Should get no extra cert because wrong folder")
  void tlsContextCustomWithWrongFolder() throws Exception {
    Set<String> filesPaths = tlsConfig.getFilesPaths(resourcesDir + "/extra-certs/wrong-folder");
    List<X509Certificate> extraCerts = tlsConfig.getExtraCerts(filesPaths);
    assertNotNull(extraCerts);
    assertEquals(0, extraCerts.size());
  }

  @Test
  @DisplayName("Should get one extra certs")
  void tlsContextCustomWithOneExtraCert() throws Exception {
    Set<String> filesPaths = tlsConfig.getFilesPaths(resourcesDir + "/extra-certs/one");
    List<X509Certificate> extraCerts = tlsConfig.getExtraCerts(filesPaths);
    assertNotNull(extraCerts);
    assertEquals(1, extraCerts.size());
  }

  @Test
  @DisplayName("Should get two identical extra certs")
  void tlsContextCustomWithTwoIdenticalExtraCerts() throws Exception {
    Set<String> filesPaths = tlsConfig.getFilesPaths(resourcesDir + "/extra-certs/identical");
    List<X509Certificate> extraCerts = tlsConfig.getExtraCerts(filesPaths);
    assertNotNull(extraCerts);
    assertEquals(1, extraCerts.size());
  }

  @Test
  @DisplayName("Should get one extra cert with invalid certs")
  void tlsContextCustomWithOneCertAndInvalidCerts() throws Exception {
    Set<String> filesPaths = tlsConfig.getFilesPaths(resourcesDir + "/extra-certs/invalid");
    List<X509Certificate> extraCerts = tlsConfig.getExtraCerts(filesPaths);
    assertNotNull(extraCerts);
    assertEquals(1, extraCerts.size());
  }
}
