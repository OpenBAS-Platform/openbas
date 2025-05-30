package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvBindByPosition;
import io.openbas.database.model.Endpoint;
import lombok.Data;

@Data
public class EndpointExport {

  @JsonProperty("asset_name")
  @CsvBindByName(column = "asset_name", required = true)
  @CsvBindByPosition(position = 0)
  private String name;

  @JsonProperty("asset_description")
  @CsvBindByName(column = "asset_description", required = true)
  @CsvBindByPosition(position = 1)
  private String description;

  @JsonProperty("endpoint_hostname")
  @CsvBindByName(column = "endpoint_hostname", required = true)
  @CsvBindByPosition(position = 2)
  private String hostname;

  @JsonProperty("endpoint_ips")
  @CsvBindByName(column = "endpoint_ips", required = true)
  @CsvBindByPosition(position = 3)
  private String ips;

  @JsonProperty("endpoint_platform")
  @CsvBindByName(column = "endpoint_platform", required = true)
  @CsvBindByPosition(position = 4)
  private Endpoint.PLATFORM_TYPE platform;

  @JsonProperty("endpoint_arch")
  @CsvBindByName(column = "endpoint_arch", required = true)
  @CsvBindByPosition(position = 5)
  private Endpoint.PLATFORM_ARCH arch;

  @JsonProperty("endpoint_mac_addresses")
  @CsvBindByName(column = "endpoint_mac_addresses", required = true)
  @CsvBindByPosition(position = 6)
  private String macAddresses;

  @JsonProperty("asset_tags")
  @CsvBindByName(column = "asset_tags", required = true)
  @CsvBindByPosition(position = 7)
  private String tags;
}
