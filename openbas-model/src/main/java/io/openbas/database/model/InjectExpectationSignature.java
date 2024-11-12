package io.openbas.database.model;

import lombok.Builder;
import lombok.Data;
import lombok.Setter;

@Setter
@Data
@Builder
public class InjectExpectationSignature {
  public static final String EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME = "parent_process_name";
  public static final String EXPECTATION_SIGNATURE_TYPE_PROCESS_NAME = "process_name";
  public static final String EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE = "command_line";
  public static final String EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE_BASE64 = "command_line_base64";
  public static final String EXPECTATION_SIGNATURE_TYPE_HASH = "hash";
  public static final String EXPECTATION_SIGNATURE_TYPE_FILE_NAME = "file_name";
  public static final String EXPECTATION_SIGNATURE_TYPE_IPV4_ADDRESS = "ipv4_address";
  public static final String EXPECTATION_SIGNATURE_TYPE_IPV6_ADDRESS = "ipv6_address";
  public static final String EXPECTATION_SIGNATURE_TYPE_HOSTNAME = "hostname";

  private String type;

  private String value;
}
