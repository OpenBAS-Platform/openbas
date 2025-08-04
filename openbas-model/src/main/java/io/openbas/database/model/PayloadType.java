package io.openbas.database.model;

import java.util.function.Supplier;
import lombok.Getter;

public enum PayloadType {
  COMMAND("Command", Command::new),
  EXECUTABLE("Executable", Executable::new),
  FILE_DROP("FileDrop", FileDrop::new),
  DNS_RESOLUTION("DnsResolution", DnsResolution::new),
  NETWORK_TRAFFIC("NetworkTraffic", NetworkTraffic::new);

  public final String key;
  @Getter public final Supplier<Payload> payloadSupplier;

  PayloadType(String key, Supplier<Payload> payloadSupplier) {
    this.key = key;
    this.payloadSupplier = payloadSupplier;
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
