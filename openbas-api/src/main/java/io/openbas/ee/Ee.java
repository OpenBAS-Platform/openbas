package io.openbas.ee;

import static io.openbas.ee.Pem.*;

import java.security.cert.*;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import org.springframework.stereotype.Service;

@Service
public class Ee {

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
    return "";
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

  public License getEnterpriseEditionInfoFromPem(String instanceId, String certificatePem)
      throws Exception {
    if (certificatePem == null) {
      return new License();
    }
    X509Certificate x509License = parseCert(certificatePem);
    System.out.println("------------------------------------");
    System.out.println("  NOT BEFORE : " + x509License.getNotBefore());
    System.out.println("  NOT AFTER : " + x509License.getNotAfter());
    System.out.println("  LICENSE_CUSTOMER : " + getInSubject(x509License, "O"));
    System.out.println("  LICENSE_PLATFORM : " + getInSubject(x509License, "OU"));
    System.out.println("  LICENSE_OPTION_TYPE : " + getExtension(x509License, "2.14521.4.4.10"));
    System.out.println("  LICENSE_OPTION_PRODUCT : " + getExtension(x509License, "2.14521.4.4.20"));
    System.out.println("  LICENSE_OPTION_CREATOR " + getExtension(x509License, "2.14521.4.4.30"));
    System.out.println("------------------------------------");
    X509Certificate caCert = getCaCert();
    boolean verifyCertificate = verifyCertificate(x509License, caCert);
    System.out.println(" verifyCertificate " + verifyCertificate);
    License license = new License();
    license.setType(getExtension(x509License, "2.14521.4.4.10"));
    boolean isValidProduct = "openbas".equals(getExtension(x509License, "2.14521.4.4.20"));
    license.setValidProduct(isValidProduct);
    license.setCreator(getExtension(x509License, "2.14521.4.4.30"));
    license.setCustomer(getInSubject(x509License, "O"));
    String licensePlatform = getInSubject(x509License, "OU");
    license.setPlatform(licensePlatform);
    license.setPlatformMatch(
        isValidProduct && (licensePlatform.equals("global") || licensePlatform.equals(instanceId)));
    license.setGlobalLicense(licensePlatform.equals("global"));
    Instant start = x509License.getNotBefore().toInstant();
    license.setStartDate(start);
    Instant end = x509License.getNotAfter().toInstant();
    license.setExpirationDate(end);
    license.setLicenseExpired(Instant.now().isAfter(end) || Instant.now().isBefore(end));
    return license;
  }

  public static void main(String[] args) throws Exception {
    new Ee().getEnterpriseEditionInfoFromPem("", "");
  }
}
