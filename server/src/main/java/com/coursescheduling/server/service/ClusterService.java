package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Cluster;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClusterService {

    private static final String COLLECTION_NAME = "clusters";
    private List<Cluster> cachedClusters = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 60 * 60 * 1000;
    
    private List<Map<String, Integer>> cachedSystemSlots = null;
    private long lastSystemSlotsFetchTime = 0;
    
    private static final String SETTINGS_COLLECTION = "system_settings";
    private static final String AVAILABILITY_DOC = "global_availability";
    
    
    public List<Cluster> getAllClusters() throws Exception {
    	
    	if (cachedClusters != null && (System.currentTimeMillis() - lastFetchTime < CACHE_DURATION)) {
            System.out.println("Returning Clusters from Server Cache");
            return cachedClusters;
        }
    	
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).orderBy("number").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Cluster> clusters = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Cluster cluster = document.toObject(Cluster.class);
            cluster.setId(document.getId());
            clusters.add(cluster);
        }
        
        this.cachedClusters = clusters;
        this.lastFetchTime = System.currentTimeMillis();
        
        return clusters;
    }

    public Cluster addCluster(Cluster cluster) throws Exception {
    	this.cachedClusters = null;
        Firestore db = FirestoreClient.getFirestore();
        
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME)
                .orderBy("number", Query.Direction.DESCENDING)
                .limit(1)
                .get();
        
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        int nextNumber = 1; 
        
        if (!documents.isEmpty()) {
            nextNumber = documents.get(0).getLong("number").intValue() + 1;
        }
        
        cluster.setNumber(nextNumber);
        
        DocumentReference docRef = (cluster.getId() != null && !cluster.getId().isEmpty()) 
                ? db.collection(COLLECTION_NAME).document(cluster.getId())
                : db.collection(COLLECTION_NAME).document();
        
        cluster.setId(docRef.getId());
        docRef.set(cluster).get();
        
        return cluster;
    }

    public void updateCluster(Cluster cluster) throws Exception {
    	this.cachedClusters = null;
        Firestore db = FirestoreClient.getFirestore();
        if (cluster.getId() == null) {
            throw new Exception("Cannot update cluster without an ID");
        }
        db.collection(COLLECTION_NAME).document(cluster.getId()).set(cluster).get();
    }

    public void deleteClusters(List<Cluster> clusters) throws Exception {
    	this.cachedClusters = null;
        Firestore db = FirestoreClient.getFirestore();
        WriteBatch batch = db.batch();

        for (Cluster cluster : clusters) {
            if (cluster.getId() != null) {
                DocumentReference docRef = db.collection(COLLECTION_NAME).document(cluster.getId());
                batch.delete(docRef);
            }
        }
        batch.commit().get();
    }
    
    
    
    public List<Map<String, Integer>> getSystemAvailability() throws Exception {
        if (cachedSystemSlots != null && (System.currentTimeMillis() - lastSystemSlotsFetchTime < CACHE_DURATION)) {
            System.out.println("Returning System Availability from Server Cache");
            return cachedSystemSlots;
        }

        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot doc = db.collection(SETTINGS_COLLECTION).document(AVAILABILITY_DOC).get().get();

        cachedSystemSlots = new ArrayList<>();

        if (doc.exists() && doc.contains("blockedSlots")) {
            List<Map<String, Object>> rawSlots = (List<Map<String, Object>>) doc.get("blockedSlots");
            
            if (rawSlots != null) {
                for (Map<String, Object> rawSlot : rawSlots) {
                    Map<String, Integer> cleanSlot = new HashMap<>();
                    
                    if (rawSlot.containsKey("day") && rawSlot.get("day") != null) {
                        cleanSlot.put("day", ((Number) rawSlot.get("day")).intValue());
                    }
                    if (rawSlot.containsKey("startFrame") && rawSlot.get("startFrame") != null) {
                        cleanSlot.put("startFrame", ((Number) rawSlot.get("startFrame")).intValue());
                    }
                    
                    cachedSystemSlots.add(cleanSlot);
                }
            }
        }

        this.lastSystemSlotsFetchTime = System.currentTimeMillis();
        return cachedSystemSlots;
    }

    public void updateSystemAvailability(List<Map<String, Integer>> blockedSlots) throws Exception {
        
        Firestore db = FirestoreClient.getFirestore();
        
        Map<String, Object> data = new HashMap<>();
        data.put("blockedSlots", blockedSlots);
        
        db.collection(SETTINGS_COLLECTION).document(AVAILABILITY_DOC).set(data).get();
        this.cachedSystemSlots = null; 
    }
    
    
}