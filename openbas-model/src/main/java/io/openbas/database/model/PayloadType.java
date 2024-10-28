package io.openbas.database.model;

public enum PayloadType {
  COMMAND("Command"),
  EXECUTABLE("Executable"),
  FILE_DROP("FileDrop"),
  DNS_RESOLUTION("DnsResolution"),
  NETWORK_TRAFFIC("NetworkTraffic");

  public final String key;

  PayloadType(String key) {
    this.key = key;
  }

  public static PayloadType fromString(String key) {
    for (PayloadType type : PayloadType.values()) {
      if (type.key.equalsIgnoreCase(key)) {
        return type;
      }
    }
    throw new IllegalArgumentException("No PayloadType found for key: " + key);
  }
}
