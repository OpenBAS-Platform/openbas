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
}
