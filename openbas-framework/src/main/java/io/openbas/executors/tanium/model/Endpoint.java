package io.openbas.executors.tanium.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Endpoint {

    private String computerID;
    private String name;
    private String[] ipAddresses;
    private String[] macAddresses;

}
