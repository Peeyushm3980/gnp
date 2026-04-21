package com.api.png.erp.repository;

import com.api.png.erp.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.time.LocalDateTime;


public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findByClientNameContainingIgnoreCase(String clientName);

    @Query("SELECT d FROM Document d WHERE d.expiryDate >= :now AND d.expiryDate <= :limit ORDER BY d.expiryDate ASC")
    List<Document> findExpiringDocuments(LocalDateTime now, LocalDateTime limit);
}