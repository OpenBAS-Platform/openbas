package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.annotation.Ipv4OrIpv6Constraint;
import io.openex.database.audit.ModelBaseListener;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import java.time.Instant;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@DiscriminatorValue("Endpoint")
@EntityListeners(ModelBaseListener.class)
public class Endpoint extends Asset {

  public enum PLATFORM_TYPE {
    LINUX,
    WINDOWS,
    DARWIN,
  }

  @Ipv4OrIpv6Constraint
  @Type(value = io.openex.database.converter.PostgreSqlStringArrayType.class)
  @Column(name = "endpoint_ips")
  @JsonProperty("endpoint_ips")
  private String[] ips;

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

  @Type(value = io.openex.database.converter.PostgreSqlStringArrayType.class)
  @Column(name = "endpoint_mac_adresses")
  @JsonProperty("endpoint_mac_adresses")
  private String[] macAdresses;

}
