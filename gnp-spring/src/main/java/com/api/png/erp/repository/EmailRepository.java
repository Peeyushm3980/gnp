package com.api.png.erp.repository;

import com.api.png.erp.entity.IngestedEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface EmailRepository extends JpaRepository<IngestedEmail, Integer> {
    
    // Semantic Search Query (PostgreSQL PGVector)
    @Query(value = "SELECT * FROM ingested_emails ORDER BY embedding <=> ?1 LIMIT 5", nativeQuery = true)
    List<IngestedEmail> findSimilarEmails(float[] queryEmbedding);
}