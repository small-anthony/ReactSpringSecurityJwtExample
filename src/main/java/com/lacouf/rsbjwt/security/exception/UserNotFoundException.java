package com.lacouf.rsbjwt.security.exception;

public class UserNotFoundException extends APIException {
    public UserNotFoundException() {
        super("userNotFound");
    }
}
