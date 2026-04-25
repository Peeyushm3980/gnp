package com.api.png.erp.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String filename;
    
    @Column(name = "file_path")
    @JsonProperty("file_path")
    private String filePath;

    @Column(name = "client_name")
    @JsonProperty("client_name")
    private String clientName;

    @Column(name = "expiry_date")
    @JsonProperty("expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate = LocalDateTime.now();

    @Column(name = "is_public")
    @JsonProperty("is_public")
    private boolean isPublic;
}