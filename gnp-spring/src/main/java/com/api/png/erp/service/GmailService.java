package com.api.png.erp.service;

import com.api.png.erp.entity.IngestedEmail;
import com.api.png.erp.repository.EmailRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GmailService {

    private final EmailRepository emailRepository;

    public GmailService(EmailRepository emailRepository) {
        this.emailRepository = emailRepository;
    }

    public List<IngestedEmail> getRecentEmails() {
        return emailRepository.findAll();
    }
    
    // In a full implementation, you would add your 
    // Google API credential logic here to fetch new emails
}