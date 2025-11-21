package com.mindcontroll.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UserDTO {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String username;
        private String displayName;
        private String email;
    }
}
