package io.openbas.rest.exception;

public class AlreadyExistingException extends RuntimeException{

    public AlreadyExistingException() {
        super();
    }

    public AlreadyExistingException(String errorMessage) {
        super(errorMessage);
    }
}
