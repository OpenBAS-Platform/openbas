package io.openbas.stix.types.enums;

public enum HashingAlgorithms {
  MD5("MD5"),
  SHA1("SHA-1"),
  SHA256("SHA-256"),
  SHA512("SHA-512"),
  SHA3256("SHA3-256"),
  SHA3512("SHA3-512"),
  SSDEEP("SSDEEP"),
  TLSH("TLSH"),
  ;

  public final String value;

  HashingAlgorithms(String value) {
    this.value = value;
  }

  public static HashingAlgorithms fromValue(String value) {
    switch (value) {
      case "MD5":
        return MD5;
      case "SHA-1":
        return SHA1;
      case "SHA-256":
        return SHA256;
      case "SHA-512":
        return SHA512;
      case "SHA3-256":
        return SHA3256;
      case "SHA3-512":
        return SHA3512;
      case "SSDEEP":
        return SSDEEP;
      case "TLSH":
        return TLSH;
      default:
        throw new IllegalArgumentException("Unknown HashingAlgorithms value: " + value);
    }
  }
}
