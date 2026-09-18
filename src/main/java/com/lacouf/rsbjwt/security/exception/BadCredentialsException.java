package com.lacouf.rsbjwt.security.exception;

public class BadCredentialsException extends AuthenticationException {
	public BadCredentialsException(String message) {
		super(message);
	}
}
