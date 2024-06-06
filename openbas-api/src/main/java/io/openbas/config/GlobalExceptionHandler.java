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

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorMessage> handleRuntimeException(RuntimeException ex) {
        log.severe("RuntimeException: " + ex.getMessage());
        ErrorMessage message = new ErrorMessage("Internal server error: " + ex.getMessage());
        return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMessage> handleException(Exception ex) {
        log.severe("Exception: " + ex.getMessage());
        ErrorMessage message = new ErrorMessage("An unexpected error occurred: " + ex.getMessage());
        return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
