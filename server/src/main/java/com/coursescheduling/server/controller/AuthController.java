package com.coursescheduling.server.controller;

import com.coursescheduling.server.service.UserService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.cloud.FirestoreClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
	
	
	@GetMapping("/users")
	public List<Map<String, String>> getAllUsers(
	        @RequestHeader("Authorization") String authHeader) throws Exception {

	    String token = authHeader.replace("Bearer ", "");
	    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

	    String uid = decodedToken.getUid();
	    String role = userService.getUserRole(uid);

	    if (!"ADMIN".equals(role)) {
	        throw new RuntimeException("Unauthorized");
	    }

	    return userService.getAllUsers(uid);
	}
	
	
	@PutMapping("/users/{uid}/role")
	public void updateUserRole(
	        @PathVariable String uid,
	        @RequestParam String role,
	        @RequestHeader("Authorization") String authHeader) throws Exception {

	    String token = authHeader.replace("Bearer ", "");
	    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

	    String currentUid = decodedToken.getUid();
	    String currentRole = userService.getUserRole(currentUid);

	    if (!"ADMIN".equals(currentRole)) {
	        throw new RuntimeException("Unauthorized");
	    }

	    userService.updateUserRole(uid, role);
	}
	
	@PostMapping("/users")
	public String createUser(
	        @RequestParam String email,
	        @RequestParam String password,
	        @RequestParam String role,
	        @RequestHeader("Authorization") String authHeader) throws Exception {

	    String token = authHeader.replace("Bearer ", "");
	    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

	    String currentUid = decodedToken.getUid();
	    String currentRole = userService.getUserRole(currentUid);

	    if (!"ADMIN".equals(currentRole)) {
	        throw new RuntimeException("Unauthorized");
	    }

	    return userService.createUser(email, password, role);
	}
	
	@DeleteMapping("/users/{uid}")
	public void deleteUser(
	        @PathVariable String uid,
	        @RequestHeader("Authorization") String authHeader) throws Exception {

	    String token = authHeader.replace("Bearer ", "");
	    FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

	    String currentUid = decodedToken.getUid();
	    String currentRole = userService.getUserRole(currentUid);

	    if (!"ADMIN".equals(currentRole)) {
	        throw new RuntimeException("Unauthorized");
	    }

	    if (currentUid.equals(uid)) {
	        throw new RuntimeException("You cannot delete yourself");
	    }

	    userService.deleteUser(uid);
	}
	
	
	
	
}