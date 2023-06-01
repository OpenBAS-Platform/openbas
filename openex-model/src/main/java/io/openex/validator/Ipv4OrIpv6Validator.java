package io.openex.validator;

import io.openex.annotation.Ipv4OrIpv6Constraint;
import org.apache.commons.validator.routines.InetAddressValidator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class Ipv4OrIpv6Validator implements ConstraintValidator<Ipv4OrIpv6Constraint, String> {

    @Override
    public void initialize(Ipv4OrIpv6Constraint ip) {
    }

    @Override
    public boolean isValid(String ip, ConstraintValidatorContext cxt) {
        InetAddressValidator validator = InetAddressValidator.getInstance();
        return validator.isValid(ip);
    }

}
