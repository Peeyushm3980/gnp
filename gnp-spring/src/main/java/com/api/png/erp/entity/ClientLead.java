package com.api.png.erp.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "leads")
@Data
public class ClientLead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String company;
    private String status;
    private Double value;
}