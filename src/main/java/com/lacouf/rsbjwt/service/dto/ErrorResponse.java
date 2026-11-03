package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

public record ErrorResponse(String message) implements DataTransferObject {
	public static ErrorResponse create(Exception e) {
		return new ErrorResponse(
				e.getMessage()
		);
	}
}
