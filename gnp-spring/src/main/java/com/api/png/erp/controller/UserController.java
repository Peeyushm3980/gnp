package com.api.png.erp.controller;

import com.api.png.erp.dto.UserTreeResponse;
import com.api.png.erp.entity.User;
import com.api.png.erp.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
            .map(u -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("username", u.getUsername());
                map.put("role", u.getRole());
                return map;
            })
            .collect(Collectors.toList());
    }

    @GetMapping("/hierarchy/{id}")
    public UserTreeResponse getHierarchy(@PathVariable Integer id) {
        User user = userRepository.findById(id).orElseThrow();
        return mapToTree(user);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserTreeResponse mapToTree(User user) {
        UserTreeResponse node = new UserTreeResponse();
        node.setId(user.getId());
        node.setUsername(user.getUsername());
        node.setRole(user.getRole());
        
        // Recursively build the tree from subordinates
        if (user.getSubordinates() != null) {
            node.setSubordinates(user.getSubordinates().stream()
                .map(this::mapToTree)
                .collect(Collectors.toList()));
        }
        return node;
    }
}