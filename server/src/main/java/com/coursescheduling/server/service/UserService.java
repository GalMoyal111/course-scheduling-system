package com.coursescheduling.server.service;

import org.springframework.stereotype.Service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;

@Service
public class UserService {

    private final Firestore firestore;

    public UserService(Firestore firestore) {
        this.firestore = firestore;
    }

    public String getUserRole(String uid) throws Exception {
        DocumentSnapshot userDoc = firestore.collection("users").document(uid).get().get();

        if (userDoc.exists() && userDoc.contains("role")) {
            return userDoc.getString("role");
        }

        return "USER"; // default
    }
}