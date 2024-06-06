package io.openbas.config;

import io.openbas.rest.exception.ElementNotFoundException;
import lombok.extern.java.Log;
import org.springdoc.api.ErrorMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Log
public class GlobalExceptionHandler {

    @ExceptionHandler(ElementNotFoundException.class)
    public ResponseEntity<ErrorMessage> handleElementNotFoundException(ElementNotFoundException ex) {
        ErrorMessage message = new ErrorMessage("Element not found: " + ex.getMessage());
        log.warning("ElementNotFoundException: " + ex.getMessage());
        return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
    }

}
