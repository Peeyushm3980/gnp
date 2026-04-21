package com.api.png.erp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tasks")
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String client;
    private String service;
    
    @JsonProperty("assigned_to")
    private String assignedTo;
    
    private String status;
    
    @JsonProperty("last_action")
    private String lastAction;
}