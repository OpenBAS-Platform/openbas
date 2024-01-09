package io.openex.validator;

import io.openex.annotation.Ipv4OrIpv6Constraint;
import org.apache.commons.validator.routines.InetAddressValidator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;

public class Ipv4OrIpv6Validator implements ConstraintValidator<Ipv4OrIpv6Constraint, String[]> {

  @Override
  public boolean isValid(final String[] ips, final ConstraintValidatorContext cxt) {
    InetAddressValidator validator = InetAddressValidator.getInstance();
    return Arrays.stream(ips).allMatch(validator::isValid);
  }

}
