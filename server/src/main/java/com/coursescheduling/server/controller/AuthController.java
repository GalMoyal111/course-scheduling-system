package com.coursescheduling.server.controller;

import com.coursescheduling.server.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final UserService userService;

	public AuthController(UserService userService) {
	    this.userService = userService;
	}
	

	@GetMapping("/me")
	public Map<String, String> me(@RequestHeader("Authorization") String authHeader) throws Exception {

	    String token = authHeader.replace("Bearer ", "");
	    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

	    String uid = decodedToken.getUid();

	    String role = userService.getUserRole(uid);

	    Map<String, String> response = new HashMap<>();
	    response.put("uid", uid);
	    response.put("role", role);

	    return response;
	}
}