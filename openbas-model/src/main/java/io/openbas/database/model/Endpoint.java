package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.openbas.annotation.Ipv4OrIpv6Constraint;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import io.openbas.helper.MultiModelDeserializer;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Stream;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@DiscriminatorValue(Endpoint.ENDPOINT_TYPE)
@EntityListeners(ModelBaseListener.class)
public class Endpoint extends Asset {

  public static final String ENDPOINT_TYPE = "Endpoint";
  private static final Set<String> BAD_MAC_ADDRESS =
      new HashSet<>(Arrays.asList("ffffffffffff", "000000000000", "0180c2000000"));
  private static final Set<String> BAD_IP_ADDRESSES =
      new HashSet<>(Arrays.asList("127.0.0.1", "::1", "169.254.0.0"));
  private static final String REGEX_MAC_ADDRESS = "[^a-z0-9]";

  public enum PLATFORM_ARCH {
    @JsonProperty("x86_64")
    x86_64,
    @JsonProperty("arm64")
    arm64,
    @JsonProperty("Unknown")
    Unknown,
  }

  public enum PLATFORM_TYPE {
    @JsonProperty("Linux")
    Linux,
    @JsonProperty("Windows")
    Windows,
    @JsonProperty("MacOS")
    MacOS,
    @JsonProperty("Container")
    Container,
    @JsonProperty("Service")
    Service,
    @JsonProperty("Generic")
    Generic,
    @JsonProperty("Internal")
    Internal,
    @JsonProperty("Unknown")
    Unknown,
  }

  @Queryable(filterable = true)
  @NotEmpty
  @Ipv4OrIpv6Constraint
  @Type(StringArrayType.class)
  @Column(name = "endpoint_ips", columnDefinition = "text[]")
  @JsonProperty("endpoint_ips")
  private String[] ips;

  @Queryable(filterable = true, sortable = true)
  @Column(name = "endpoint_hostname")
  @JsonProperty("endpoint_hostname")
  private String hostname;

  @Queryable(filterable = true, sortable = true)
  @Column(name = "endpoint_platform")
  @JsonProperty("endpoint_platform")
  @Enumerated(EnumType.STRING)
  @NotNull
  private PLATFORM_TYPE platform;

  @Queryable(filterable = true, sortable = true)
  @Column(name = "endpoint_arch")
  @JsonProperty("endpoint_arch")
  @Enumerated(EnumType.STRING)
  @NotNull
  private PLATFORM_ARCH arch;

  @Type(StringArrayType.class)
  @Column(name = "endpoint_mac_addresses")
  @JsonProperty("endpoint_mac_addresses")
  private String[] macAddresses;

  @OneToMany(
      mappedBy = "asset",
      fetch = FetchType.EAGER,
      cascade = CascadeType.ALL,
      orphanRemoval = true)
  // method
  @JsonProperty("asset_agents")
  @JsonSerialize(using = MultiModelDeserializer.class)
  private List<Agent> agents = new ArrayList<>();

  public static String[] setMacAddresses(String[] macAddresses) {
    return Arrays.stream(macAddresses)
        .map(macAddress -> macAddress.toLowerCase().replaceAll(REGEX_MAC_ADDRESS, ""))
        .filter(macAddress -> !BAD_MAC_ADDRESS.contains(macAddress))
        .distinct()
        .toArray(String[]::new);
  }

  public static String[] setIps(String[] ips) {
    return Arrays.stream(ips)
        .map(String::toLowerCase)
        .filter(ip -> !BAD_IP_ADDRESSES.contains(ip))
        .distinct()
        .toArray(String[]::new);
  }

  public void addAllMacAddresses(String[] macAddresses) {
    if (this.macAddresses == null) {
      this.macAddresses = new String[0];
    } else {
      this.macAddresses = setMacAddresses(this.macAddresses);
    }
    if (macAddresses == null) {
      macAddresses = new String[0];
    } else {
      macAddresses = setMacAddresses(macAddresses);
    }
    this.macAddresses =
        Stream.concat(Arrays.stream(macAddresses), Arrays.stream(this.macAddresses))
            .distinct()
            .toArray(String[]::new);
  }

  public void addAllIpAddresses(String[] ips) {
    if (this.ips == null) {
      this.ips = new String[0];
    } else {
      this.ips = setIps(this.ips);
    }
    if (ips == null) {
      ips = new String[0];
    } else {
      ips = setIps(ips);
    }
    this.ips =
        Stream.concat(Arrays.stream(ips), Arrays.stream(this.ips))
            .distinct()
            .toArray(String[]::new);
  }

  public void setHostname(String hostname) {
    this.hostname = hostname.toLowerCase();
  }

  public Endpoint() {}

  public Endpoint(String id, String type, String name, PLATFORM_TYPE platform) {
    super(id, type, name);
    this.platform = platform;
  }
}
