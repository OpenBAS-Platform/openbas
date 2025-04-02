package io.openbas.ee;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class License {
  private boolean isLicenseEnterprise = false;
  private boolean isValidCert = false;
  private String type;
  private String creator;
  private boolean isValidProduct = false;
  private String customer;
  private String platform;
  private boolean isPlatformMatch = false;
  private boolean isGlobalLicense = false;
  private boolean isLicenseExpired = true;
  private Instant startDate;
  private Instant expirationDate;
  private boolean isLicensePrevention;
  private boolean isLicenseValidated = false;
  private boolean isLicenseByConfiguration = false;
  private long extraExpirationDays = 0;

  @Override
  public String toString() {
    return "License{" +
            "isLicenseEnterprise=" + isLicenseEnterprise +
            ", isValidCert=" + isValidCert +
            ", type='" + type + '\'' +
            ", creator='" + creator + '\'' +
            ", isValidProduct=" + isValidProduct +
            ", customer='" + customer + '\'' +
            ", platform='" + platform + '\'' +
            ", isPlatformMatch=" + isPlatformMatch +
            ", isGlobalLicense=" + isGlobalLicense +
            ", isLicenseExpired=" + isLicenseExpired +
            ", startDate=" + startDate +
            ", expirationDate=" + expirationDate +
            ", isLicensePrevention=" + isLicensePrevention +
            ", isLicenseValidated=" + isLicenseValidated +
            ", isLicenseByConfiguration=" + isLicenseByConfiguration +
            '}';
  }
}
