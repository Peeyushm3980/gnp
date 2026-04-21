package com.api.png.erp.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class AiAgentService {

    private final ChatClient chatClient;

    public AiAgentService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String analyzeEmailContext(String emailBody) {
        return chatClient.prompt()
            .user(u -> u.text("Analyze this email for ERP tasks: {body}")
                        .param("body", emailBody))
            .call()
            .content();
    }
}