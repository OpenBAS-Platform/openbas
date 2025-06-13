package io.openbas.database.raw;

import java.time.Instant;
import java.util.Set;

public interface RawAsset {

  String getAsset_id();

  String getAsset_type();

  String getAsset_name();

  String getAsset_description();

  Instant getAsset_created_at();

  Instant getAsset_updated_at();

  String getAsset_external_reference();

  Set<String> getEndpoint_ips();

  String getEndpoint_hostname();

  String getEndpoint_platform();

  String getEndpoint_arch();

  Set<String> getEndpoint_mac_addresses();

  String getEndpoint_seen_ip();

  String getSecurity_platform_type();

  String getSecurity_platform_logo_light();

  String getSecurity_platform_logo_dark();

  Set<String> getAsset_findings();

  Set<String> getAsset_tags();
}
