package io.openex.rest.helper;

import io.openex.database.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(AccessDeniedException.class)
    public Map<String, String> handleValidationExceptions() {
        Map<String, String> errors = new HashMap<>();
        errors.put("Access is denied", "ACCESS_DENIED");
        return errors;
    }

    protected User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    protected <T> List<T> fromIterable(Iterable<T> results) {
        return stream(results.spliterator(), false).collect(Collectors.toList());
    }
}
