package io.openbas.ee;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class License {

  @JsonProperty("license_is_enterprise")
  private boolean isLicenseEnterprise = false;

  @JsonProperty("license_is_valid_cert")
  private boolean isValidCert = false;

  @JsonProperty("license_type")
  private String type;

  @JsonProperty("license_creator")
  private String creator;

  @JsonProperty("license_is_valid_product")
  private boolean isValidProduct = false;

  @JsonProperty("license_customer")
  private String customer;

  @JsonProperty("license_platform")
  private String platform;

  @JsonProperty("license_is_platform_match")
  private boolean isPlatformMatch = false;

  @JsonProperty("license_is_global")
  private boolean isGlobalLicense = false;

  @JsonProperty("license_is_expired")
  private boolean isLicenseExpired = true;

  @JsonProperty("license_start_date")
  private Instant startDate;

  @JsonProperty("license_expiration_date")
  private Instant expirationDate;

  @JsonProperty("license_is_prevention")
  private boolean isLicensePrevention;

  @JsonProperty("license_is_validated")
  private boolean isLicenseValidated = false;

  @JsonProperty("license_is_by_configuration")
  private boolean isLicenseByConfiguration = false;

  @JsonProperty("license_extra_expiration_days")
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
