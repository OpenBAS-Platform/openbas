package io.openex.validator;

import io.openex.annotation.Ipv4OrIpv6Constraint;
import org.apache.commons.validator.routines.InetAddressValidator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class Ipv4OrIpv6Validator implements ConstraintValidator<Ipv4OrIpv6Constraint, String> {

  @Override
  public boolean isValid(final String ip, final ConstraintValidatorContext cxt) {
    InetAddressValidator validator = InetAddressValidator.getInstance();
    return validator.isValid(ip);
  }

}
