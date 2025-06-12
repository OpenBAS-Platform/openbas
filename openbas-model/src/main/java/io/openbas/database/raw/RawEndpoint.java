package io.openbas.database.raw;

import java.util.Set;

public interface RawEndpoint extends RawAsset {
  Set<String> getEndpoint_ips();

  String getEndpoint_hostname();

  String getEndpoint_platform();

  String getEndpoint_arch();

  Set<String> getEndpoint_mac_addresses();

  Set<String> getEndpoint_findings();
}
