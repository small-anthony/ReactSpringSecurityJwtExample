package com.lacouf.rsbjwt.security.exception;

public class InvalidJwtTokenException extends APIException {
    public InvalidJwtTokenException(String message) {
        super(message);
    }
}
