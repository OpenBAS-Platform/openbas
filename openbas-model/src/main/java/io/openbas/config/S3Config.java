package io.openbas.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.s3")
@Data
public class S3Config {

  @JsonProperty("use_aws_role")
  private boolean useAwsRole;

  @JsonProperty("sts_endpoint")
  private String stsEndpoint;
}
