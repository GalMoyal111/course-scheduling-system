package com.coursescheduling.server.algorithm.model;

import java.util.ArrayList;
import java.util.List;

public class Domain {
	private List<DomainValue> values;
	
	public Domain() {
        this.values = new ArrayList<>();
    }
	
	public List<DomainValue> getValues() {
        return values;
    }
	
	
	public void addValue(DomainValue value) {
        values.add(value);
    }
	
	

}
