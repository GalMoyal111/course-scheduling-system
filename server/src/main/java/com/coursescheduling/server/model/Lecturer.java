package com.coursescheduling.server.model;

import com.coursescheduling.server.algorithm.model.DomainValue;
import java.util.ArrayList;
import java.util.List;


public class Lecturer {
	
	private String id;
	private String name;
	private List<DomainValue> unavailableSlots;
	private List<DomainValue> nonPreferredSlots;
	
	
	// Creates a Lecturer instance.
	public Lecturer() {
        this.unavailableSlots = new ArrayList<>();
        this.nonPreferredSlots = new ArrayList<>();
    }
	
	// Creates a Lecturer instance.
	public Lecturer(String id, String name, List<DomainValue> unavailableSlots, List<DomainValue> nonPreferredSlots) {
        this.id = id;
        this.name = name;
        this.unavailableSlots = unavailableSlots != null ? unavailableSlots : new ArrayList<>();
        this.nonPreferredSlots = nonPreferredSlots != null ? nonPreferredSlots : new ArrayList<>();
    }

	// Returns the non preferred slots.
	public List<DomainValue> getNonPreferredSlots() {
		return nonPreferredSlots;
	}

	// Sets the non preferred slots.
	public void setNonPreferredSlots(List<DomainValue> nonPreferredSlots) {
		this.nonPreferredSlots = nonPreferredSlots;
	}

	// Returns the id.
	public String getId() {
		return id;
	}

	// Sets the id.
	public void setId(String id) {
		this.id = id;
	}

	// Returns the name.
	public String getName() {
		return name;
	}

	// Sets the name.
	public void setName(String name) {
		this.name = name;
	}

	// Returns the unavailable slots.
	public List<DomainValue> getUnavailableSlots() {
		return unavailableSlots;
	}

	// Sets the unavailable slots.
	public void setUnavailableSlots(List<DomainValue> unavailableSlots) {
		this.unavailableSlots = unavailableSlots;
	}

}
