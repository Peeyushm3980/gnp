package com.api.png.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingested_emails")
@Data
public class IngestedEmail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, name = "message_id")
    private String messageId;

    private String subject;
    private String sender;
    
    @Column(columnDefinition = "TEXT")
    private String body;

    private LocalDateTime receivedAt = LocalDateTime.now();

    // 2026 Vector Support for RAG
    @Column(columnDefinition = "vector(1536)") 
    private float[] embedding;
}