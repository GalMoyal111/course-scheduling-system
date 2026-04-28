package com.coursescheduling.server.service;

import com.coursescheduling.server.model.Cluster;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClusterService {

    private static final String COLLECTION_NAME = "clusters";

    public List<Cluster> getAllClusters() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = db.collection(COLLECTION_NAME).orderBy("number").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Cluster> clusters = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Cluster cluster = document.toObject(Cluster.class);
            cluster.setId(document.getId());
            clusters.add(cluster);
        }
        return clusters;
    }

    public Cluster addCluster(Cluster cluster) throws Exception {
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
        Firestore db = FirestoreClient.getFirestore();
        if (cluster.getId() == null) {
            throw new Exception("Cannot update cluster without an ID");
        }
        db.collection(COLLECTION_NAME).document(cluster.getId()).set(cluster).get();
    }

    public void deleteClusters(List<Cluster> clusters) throws Exception {
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
}