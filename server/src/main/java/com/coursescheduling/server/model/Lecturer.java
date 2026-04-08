package com.coursescheduling.server.model;

import com.coursescheduling.server.algorithm.model.DomainValue;
import java.util.ArrayList;
import java.util.List;


public class Lecturer {
	
	private String id;
	private String name;
	private List<DomainValue> unavailableSlots;
	
	public Lecturer() {
        this.unavailableSlots = new ArrayList<>();
    }
	
	public Lecturer(String id, String name, List<DomainValue> unavailableSlots) {
        this.id = id;
        this.name = name;
        this.unavailableSlots = unavailableSlots != null ? unavailableSlots : new ArrayList<>();
    }

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<DomainValue> getUnavailableSlots() {
		return unavailableSlots;
	}

	public void setUnavailableSlots(List<DomainValue> unavailableSlots) {
		this.unavailableSlots = unavailableSlots;
	}

}
