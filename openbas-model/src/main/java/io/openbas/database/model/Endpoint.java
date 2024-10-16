package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Ipv4OrIpv6Constraint;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@DiscriminatorValue(Endpoint.ENDPOINT_TYPE)
@EntityListeners(ModelBaseListener.class)
public class Endpoint extends Asset {

  public static final String ENDPOINT_TYPE = "Endpoint";

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
  @Column(name = "endpoint_ips")
  @JsonProperty("endpoint_ips")
  private String[] ips;

  @Queryable(filterable = true, sortable = true)
  @Column(name = "endpoint_hostname")
  @JsonProperty("endpoint_hostname")
  private String hostname;

  @Queryable(filterable = true, sortable = true)
  @Column(name = "endpoint_agent_version")
  @JsonProperty("endpoint_agent_version")
  private String agentVersion;

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

  @Column(name = "endpoint_mac_addresses")
  @JsonProperty("endpoint_mac_addresses")
  private String[] macAddresses;

  public Endpoint() {

  }

  public Endpoint(String id, String type, String name, PLATFORM_TYPE platform) {
    super(id, type, name);
    this.platform = platform;
  }
}
