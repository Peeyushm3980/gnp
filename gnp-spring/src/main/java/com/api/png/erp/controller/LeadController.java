package com.api.png.erp.controller;

import com.api.png.erp.entity.ClientLead;
import com.api.png.erp.repository.LeadRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*") // Matches your Python CORS settings
public class LeadController {

    private final LeadRepository leadRepository;

    public LeadController(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    @GetMapping
    public List<ClientLead> getAllLeads() {
        return leadRepository.findAll();
    }
}