package com.coursescheduling.server.algorithm.model;

import java.util.ArrayList;
import java.util.List;

public class Domain {
	private List<DomainValue> values;
	
	// Creates a Domain instance.
	public Domain() {
        this.values = new ArrayList<>();
    }
	
	// Returns the values.
	public List<DomainValue> getValues() {
        return values;
    }
	
	
	// Adds the value.
	public void addValue(DomainValue value) {
        values.add(value);
    }	

}
