
package com.coursescheduling.server.model;

public class Cluster {

	private String id;
	private String name;
	private int number;
	
	public Cluster() {}
	
	// Creates a Cluster instance.
	public Cluster(String id, String name, int number) {
        this.id = id;
        this.name = name;
        this.number = number;
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

	// Returns the number.
	public int getNumber() {
		return number;
	}

	// Sets the number.
	public void setNumber(int number) {
		this.number = number;
	}
	
}
