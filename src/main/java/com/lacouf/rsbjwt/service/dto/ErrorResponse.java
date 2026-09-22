package com.lacouf.rsbjwt.service.dto;

import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

public record ErrorResponse(String message) implements DataTransferObject { }
