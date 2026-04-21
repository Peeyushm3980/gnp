package com.api.png.erp.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserTreeResponse {
    private Integer id;
    private String username;
    private String role;
    private List<UserTreeResponse> subordinates;
}