package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.annotation.Ipv4OrIpv6Constraint;
import io.openex.database.audit.ModelBaseListener;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "endpoints")
@EntityListeners(ModelBaseListener.class)
public class Endpoint extends Asset {

  public enum OS_TYPE {
    LINUX,
    WINDOWS,
  }

  @NotBlank
  @Ipv4OrIpv6Constraint
  @Column(name = "endpoint_ip")
  @JsonProperty("endpoint_ip")
  private String ip;

  @Column(name = "endpoint_hostname")
  @JsonProperty("endpoint_hostname")
  private String hostname;

  @Column(name = "endpoint_os")
  @JsonProperty("endpoint_os")
  @Enumerated(EnumType.STRING)
  private OS_TYPE os;

}
