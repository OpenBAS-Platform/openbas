package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Setter
@Getter
@Builder
public class PayloadCommandBlock {

  @JsonProperty("command_executor")
  private String executor;

  @JsonProperty("command_content")
  private String content;

  @JsonProperty("payload_cleanup_command")
  private List<String> cleanupCommand;
}
