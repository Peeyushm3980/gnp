package com.api.png.erp.controller;

import com.api.png.erp.entity.IngestedEmail;
import com.api.png.erp.repository.EmailRepository;
import com.api.png.erp.service.AiAgentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gmail")
@CrossOrigin(origins = "*")
public class GmailController {

    private final EmailRepository emailRepository;
    private final AiAgentService aiService;

    public GmailController(EmailRepository emailRepository, AiAgentService aiService) {
        this.emailRepository = emailRepository;
        this.aiService = aiService;
    }

    @GetMapping("/emails")
    public List<IngestedEmail> getEmails() {
        return emailRepository.findAll();
    }

    @PostMapping("/analyze-email/{id}")
    public String analyzeEmail(@PathVariable Integer id) {
        IngestedEmail email = emailRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Email not found"));
        return aiService.analyzeEmailContext(email.getBody());
    }

    @PostMapping("/save-attachment")
    public ResponseEntity<?> saveAttachment(@RequestBody Map<String, Object> payload) {
        // Logic to bridge Google Service and local storage (shutil.copy equivalent)
        return ResponseEntity.ok(Map.of("message", "Attachment saved to vault"));
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncEmails() {
        // Trigger the background sync process
        return ResponseEntity.ok(Map.of("status", "Sync started"));
    }
}