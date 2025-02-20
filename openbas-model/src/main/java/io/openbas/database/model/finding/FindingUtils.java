package io.openbas.database.model.finding;

import jakarta.validation.constraints.NotBlank;
import org.apache.commons.validator.routines.InetAddressValidator;

import static io.openbas.database.model.finding.FindingType.ValueType.*;

public class FindingUtils {

  private FindingUtils() {}

  public static Finding createFindingString(@NotBlank final String field, @NotBlank final String value) {
    Finding finding = new Finding();
    finding.setType(STRING);
    finding.setField(field);
    finding.setValue(value);
    return finding;
  }

  public static final InetAddressValidator inetAddressValidator = InetAddressValidator.getInstance();

  public static Finding createFindingIPV6(@NotBlank final String field, @NotBlank final String value) {
    if (!inetAddressValidator.isValid(value)) {
      throw new IllegalArgumentException("value is not a valid IPv6 address");
    }
    Finding finding = new Finding();
    finding.setType(IPV6);
    finding.setField(field);
    finding.setValue(value);
    return finding;
  }

  public static final String CREDENTIALS_SEPARATOR = ":";

  public static Finding createFindingCredentials(
      @NotBlank final String field,
      @NotBlank final String username,
      @NotBlank final String password) {
    Finding finding = new Finding();
    finding.setType(CREDENTIALS);
    finding.setField(field);
    finding.setValue(username + CREDENTIALS_SEPARATOR + password);
    return finding;
  }

}
