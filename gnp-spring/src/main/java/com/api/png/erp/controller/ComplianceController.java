package com.api.png.erp.controller;

import com.api.png.erp.entity.Document;
import com.api.png.erp.repository.DocumentRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;


@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "*")
public class ComplianceController {

    private final DocumentRepository documentRepository;

    public ComplianceController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping("/expiring")
    public List<Document> getExpiringDocuments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime limit = now.plusDays(90);
        List<Document> expiring = documentRepository.findExpiringDocuments(now, limit);
        
        // Safety check: Ensure UI never gets 'undefined'
        return expiring != null ? expiring : new ArrayList<>();
    }
}