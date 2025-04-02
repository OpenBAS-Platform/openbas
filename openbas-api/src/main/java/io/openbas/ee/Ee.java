package io.openbas.ee;

import static io.openbas.ee.Pem.*;

import java.security.cert.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;

import io.openbas.config.OpenBASConfig;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

@Service
public class Ee {

  public static final String LICENSE_OPTION_TYPE = "2.14521.4.4.10";
  public static final String LICENSE_OPTION_PRODUCT = "2.14521.4.4.20";
  public static final String LICENSE_OPTION_CREATOR = "2.14521.4.4.30";

  @Resource
  private OpenBASConfig openBASConfig;

  public String getInSubject(X509Certificate caCert, String variable) throws Exception {
    String dn = caCert.getSubjectX500Principal().getName();
    LdapName ldapDn = new LdapName(dn);
    for (Rdn rdn : ldapDn.getRdns()) {
      Attributes attributes = rdn.toAttributes();
      Attribute ouAttribute = attributes.get(variable);
      if (ouAttribute != null) {
        return ouAttribute.get().toString();
      }
    }
    throw new UnsupportedOperationException("No attribute found for " + variable);
  }

  public static boolean verifyCertificate(
      X509Certificate certToVerify, X509Certificate trustedCaCert) {
    try {
      TrustAnchor trustAnchor = new TrustAnchor(trustedCaCert, null);
      Set<TrustAnchor> trustAnchors = Collections.singleton(trustAnchor);
      PKIXParameters pkixParams = new PKIXParameters(trustAnchors);
      pkixParams.setRevocationEnabled(false);
      CertificateFactory cf = CertificateFactory.getInstance("X.509");
      List<Certificate> certList = Collections.singletonList(certToVerify);
      CertPath certPath = cf.generateCertPath(certList);
      CertPathValidator validator = CertPathValidator.getInstance("PKIX");
      validator.validate(certPath, pkixParams);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public License getEnterpriseEditionInfoFromPem(String instanceId, String pem) {
    String pemFromConfig = openBASConfig.getApplicationLicense();
    boolean isLicenseByConfig = pemFromConfig != null && !pemFromConfig.isEmpty();
    String certificatePem = isLicenseByConfig ? pemFromConfig : pem;
    if (certificatePem == null || certificatePem.isEmpty()) {
        throw new IllegalArgumentException("Certificate Pem is null or empty");
    }
    try {
      X509Certificate x509License = parseCert(certificatePem);
      X509Certificate caCert = getCaCert();
      boolean verifyCertificate = verifyCertificate(x509License, caCert);
      License license = new License();
      license.setLicenseByConfiguration(isLicenseByConfig);
      license.setLicenseEnterprise(true);
      license.setValidCert(true);
      String licenseType = getExtension(x509License, LICENSE_OPTION_TYPE);
      license.setType(licenseType);
      boolean isValidProduct = "openbas".equals(getExtension(x509License, LICENSE_OPTION_PRODUCT));
      license.setValidProduct(isValidProduct);
      license.setCreator(getExtension(x509License, LICENSE_OPTION_CREATOR));
      license.setCustomer(getInSubject(x509License, "O"));
      String licensePlatform = getInSubject(x509License, "OU");
      license.setPlatform(licensePlatform);
      boolean isPlatformMatch = isValidProduct && (licensePlatform.equals("global") || licensePlatform.equals(instanceId));
      license.setPlatformMatch(isPlatformMatch);
      license.setGlobalLicense(licensePlatform.equals("global"));
      Instant start = x509License.getNotBefore().toInstant();
      license.setStartDate(start);
      Instant end = x509License.getNotAfter().toInstant();
      license.setExpirationDate(end);
      boolean isLicenseExpired = Instant.now().isAfter(end) || Instant.now().isBefore(start);
      license.setLicenseExpired(isLicenseExpired);
      boolean isLicenseValidated = verifyCertificate && isPlatformMatch;
      license.setLicenseValidated(isLicenseValidated);
      // Handle grace period
      if (isLicenseValidated && isLicenseExpired) {
        // If trial license, deactivation for expiration is direct
        if (!licenseType.equals("trial")) {
          Instant extraExpirationEndDate = x509License.getNotBefore().toInstant().plus(3, ChronoUnit.MONTHS);
          Instant now = Instant.now();
          boolean isLicenseExtended = now.isBefore(extraExpirationEndDate);
          license.setExtraExpirationDays(ChronoUnit.DAYS.between(now, extraExpirationEndDate));
          license.setLicenseValidated(isLicenseExtended);
        }
      }
      return license;
    } catch (Exception e) {
      License license = new License();
      license.setLicenseByConfiguration(isLicenseByConfig);
      return license;
    }
  }
}
