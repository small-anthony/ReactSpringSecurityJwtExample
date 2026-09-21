package com.lacouf.rsbjwt.presentation;

import com.lacouf.rsbjwt.security.exception.BadCredentialsException;
import com.lacouf.rsbjwt.security.exception.InvalidJwtTokenException;
import com.lacouf.rsbjwt.security.exception.UserNotFoundException;
import com.lacouf.rsbjwt.service.UserAppService;
import com.lacouf.rsbjwt.service.dto.ErrorResponse;
import com.lacouf.rsbjwt.service.dto.JWTAuthResponse;
import com.lacouf.rsbjwt.service.dto.LoginDto;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.DataTransferObject;
import com.lacouf.rsbjwt.service.dto.interfaceDTO.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

	private final UserAppService userService;

	public UserController(UserAppService userService) {
		this.userService = userService;
	}

	@PostMapping("/login")
	public ResponseEntity<DataTransferObject> authenticateUser(@RequestBody LoginDto loginDto){
		try {
			String accessToken = userService.authenticateUser(loginDto);
			final JWTAuthResponse authResponse = new JWTAuthResponse(accessToken);
			return ResponseEntity.accepted()
					.contentType(MediaType.APPLICATION_JSON)
					.body(authResponse);
		} catch (BadCredentialsException | UserNotFoundException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("bad_credentials"));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@GetMapping("/me")
	public ResponseEntity<DataTransferObject> getMe(HttpServletRequest request){
		try {
			return ResponseEntity.accepted().contentType(MediaType.APPLICATION_JSON).body(
				userService.getMe(request.getHeader("Authorization")));
		} catch (InvalidJwtTokenException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("bad_token"));
		}
	}
}
