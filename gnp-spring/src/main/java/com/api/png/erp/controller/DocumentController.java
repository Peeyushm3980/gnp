package com.api.png.erp.controller;

import com.api.png.erp.entity.Document;
import com.api.png.erp.repository.DocumentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentRepository documentRepository;

    public DocumentController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @PostMapping("/search")
    public List<Document> searchByClient(@RequestParam String clientName) {
        return documentRepository.findByClientNameContainingIgnoreCase(clientName);
    }
}