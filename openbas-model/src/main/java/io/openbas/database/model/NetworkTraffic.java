package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.openbas.database.audit.ModelBaseListener;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@DiscriminatorValue(NetworkTraffic.NETWORK_TRAFFIC_TYPE)
@EntityListeners(ModelBaseListener.class)
public class NetworkTraffic extends Payload {

  public static final String NETWORK_TRAFFIC_TYPE = "NetworkTraffic";

  @Queryable(filterable = true, sortable = true)
  @Column(name = "network_traffic_ip")
  @JsonProperty("network_traffic_ip")
  @NotNull
  private String ip;

  public NetworkTraffic() {

  }

  public NetworkTraffic(String id, String type, String name) {
    super(id, type, name);
  }
}
