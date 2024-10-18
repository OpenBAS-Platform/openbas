package io.openbas.validator;

import io.openbas.annotation.Ipv4OrIpv6Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import org.apache.commons.validator.routines.InetAddressValidator;

public class Ipv4OrIpv6Validator implements ConstraintValidator<Ipv4OrIpv6Constraint, String[]> {

  @Override
  public boolean isValid(final String[] ips, final ConstraintValidatorContext cxt) {
    InetAddressValidator validator = InetAddressValidator.getInstance();
    return Arrays.stream(ips).allMatch(validator::isValid);
  }
}
