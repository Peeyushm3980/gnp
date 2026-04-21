package com.api.png.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "staff_name")
    private String staffName;

    private LocalDateTime timestamp = LocalDateTime.now();
    
    private Double latitude;
    private Double longitude;

    @Column(name = "location_name")
    private String locationName;
}