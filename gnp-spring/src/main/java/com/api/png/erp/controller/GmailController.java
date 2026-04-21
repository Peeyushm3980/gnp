package com.api.png.erp.controller;

import com.api.png.erp.entity.IngestedEmail;
import com.api.png.erp.repository.EmailRepository;
import com.api.png.erp.service.AiAgentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}