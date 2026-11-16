package com.lacouf.rsbjwt.presentation.RequestDto;

import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;

public record DismissNotificationRequest(
		Long id
) implements DataTransferObject { }
