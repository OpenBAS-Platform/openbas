package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.annotation.Ipv4OrIpv6Constraint;
import io.openex.database.audit.ModelBaseListener;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.Instant;
import java.util.List;

import static java.time.Instant.now;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "endpoints")
@EntityListeners(ModelBaseListener.class)
public class Endpoint extends Asset {

  public enum PLATFORM_TYPE {
    LINUX,
    WINDOWS,
  }

  @Ipv4OrIpv6Constraint
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "ips", joinColumns = @JoinColumn(name = "endpoint_id"))
  @Column(name = "ip")
  @JsonProperty("endpoint_ips")
  private List<String> ips;

  @Column(name = "endpoint_hostname")
  @JsonProperty("endpoint_hostname")
  private String hostname;

  @Column(name = "endpoint_platform")
  @JsonProperty("endpoint_platform")
  @Enumerated(EnumType.STRING)
  private PLATFORM_TYPE platform;

  @Column(name = "endpoint_last_seen")
  @JsonProperty("endpoint_last_seen")
  private Instant lastSeen;

  @ElementCollection(fetch = FetchType.LAZY)
  @CollectionTable(name = "macadresses", joinColumns = @JoinColumn(name = "endpoint_id"))
  @Column(name = "mac_adress")
  @JsonProperty("endpoint_mac_adresses")
  private List<String> macAdresses;

}
