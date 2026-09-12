package com.lacouf.rsbjwt.service.dto.interfaceDTO;

import com.lacouf.rsbjwt.model.auth.Role;

public interface UserDto {
    int id();
    String firstName();
    String lastName();
    String email();
    Role role();
}
