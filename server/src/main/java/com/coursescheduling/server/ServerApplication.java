package com.coursescheduling.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.coursescheduling.server.algorithm.preprocessing.VariableBuilder;
import com.coursescheduling.server.model.Semester;

// The main application class that bootstraps the Spring Boot application. It contains the main method which is the entry point of the application.
@SpringBootApplication
public class ServerApplication {

    public static void main(String[] args) {
    	SpringApplication.run(ServerApplication.class, args);
    	
    }
}