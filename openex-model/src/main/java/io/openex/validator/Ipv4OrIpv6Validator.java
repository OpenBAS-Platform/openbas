package io.openex.validator;

import io.openex.annotation.Ipv4OrIpv6Constraint;
import org.apache.commons.validator.routines.InetAddressValidator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.List;

public class Ipv4OrIpv6Validator implements ConstraintValidator<Ipv4OrIpv6Constraint, List<String>> {

  @Override
  public boolean isValid(final List<String> ips, final ConstraintValidatorContext cxt) {
    InetAddressValidator validator = InetAddressValidator.getInstance();
    return ips.stream().allMatch(validator::isValid);
  }

}
