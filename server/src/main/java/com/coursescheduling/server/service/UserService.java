package com.coursescheduling.server.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;

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
    
    
    
    
    
    public List<Map<String, String>> getAllUsers(String currentUid) throws Exception {
        List<Map<String, String>> usersList = new ArrayList<>();

        List<QueryDocumentSnapshot> documents =
                firestore.collection("users").get().get().getDocuments();

        for (QueryDocumentSnapshot doc : documents) {

            if (doc.getId().equals(currentUid)) continue;

            Map<String, String> user = new HashMap<>();
            user.put("uid", doc.getId());
            user.put("email", doc.getString("email"));
            user.put("role", doc.getString("role"));

            usersList.add(user);
        }

        return usersList;
    }
    
    
    public void updateUserRole(String uid, String role) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        db.collection("users")
          .document(uid)
          .update("role", role);
    }
    
    
    public String createUser(String email, String password, String role) throws Exception {
    	email = email.toLowerCase();

        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            throw new IllegalArgumentException("Invalid role");
        }

        try {
            try {
                FirebaseAuth.getInstance().getUserByEmail(email);
                throw new RuntimeException("User already exists");
            } catch (Exception e) {
            }

            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(email)
                    .setPassword(password);

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            String uid = userRecord.getUid();

            Firestore db = FirestoreClient.getFirestore();

            Map<String, String> userData = new HashMap<>();
            userData.put("email", email);
            userData.put("role", role);

            db.collection("users")
              .document(uid)
              .set(userData);

            return uid;

        } catch (IllegalArgumentException e) {
            throw e; // validation errors
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to create user");
        }
    }
    
    
    
    public void deleteUser(String uid) throws Exception {

        FirebaseAuth.getInstance().deleteUser(uid);

        Firestore db = FirestoreClient.getFirestore();

        db.collection("users")
          .document(uid)
          .delete();
    }
    
    
    
}


