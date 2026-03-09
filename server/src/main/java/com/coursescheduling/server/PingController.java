package com.coursescheduling.server;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// A simple controller to test if the server is running and responding to requests. It defines a GET endpoint at /api/ping that returns a simple string response.
@RestController
@RequestMapping("/api")
public class PingController {
    // Endpoint to test if the server is up and running. When you send a GET request to /api/ping, it will respond with "pong from server!".
    @GetMapping("/ping")
    public String ping() {
        return "pong from server!";
    }
}