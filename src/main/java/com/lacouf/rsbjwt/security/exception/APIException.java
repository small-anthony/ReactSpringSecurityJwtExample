package com.lacouf.rsbjwt.security.exception;

public abstract class APIException extends RuntimeException {
	protected final String message;

	public APIException(String message) {
		this.message = message;
	}

	@Override
	public String getMessage(){
		return message;
	}
}
