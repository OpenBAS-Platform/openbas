package io.openex.rest.helper;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.StreamSupport.stream;

public class RestBehavior {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ValidationErrorBag handleValidationExceptions(MethodArgumentNotValidException ex) {
        ValidationErrorBag bag = new ValidationErrorBag();
        ValidationError errors = new ValidationError();
        Map<String, ValidationContent> errorsBag = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errorsBag.put(fieldName, new ValidationContent(errorMessage));
        });
        errors.setChildren(errorsBag);
        bag.setErrors(errors);
        return bag;
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(AccessDeniedException.class)
    public ValidationErrorBag handleValidationExceptions() {
        ValidationErrorBag bag = new ValidationErrorBag(HttpStatus.UNAUTHORIZED.value(), "ACCESS_DENIED");
        ValidationError errors = new ValidationError();
        Map<String, ValidationContent> errorsBag = new HashMap<>();
        errorsBag.put("username", new ValidationContent("Invalid user or password"));
        errors.setChildren(errorsBag);
        bag.setErrors(errors);
        return bag;
    }

    protected <T> List<T> fromIterable(Iterable<T> results) {
        return stream(results.spliterator(), false).collect(Collectors.toList());
    }
}
