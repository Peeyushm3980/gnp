package com.api.png.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String username;

    @Column(name = "password_hash")
    private String passwordHash;

    private String role; // root, manager, user

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private User manager;

    @OneToMany(mappedBy = "manager")
    private List<User> subordinates;
}