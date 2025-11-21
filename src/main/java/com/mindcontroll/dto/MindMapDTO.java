package com.mindcontroll.dto;

import com.mindcontroll.entity.LayoutConfiguration;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

public class MindMapDTO {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String name;
        private String description;
        private UserDTO.Response owner;
        private List<ParticipantDTO.Response> participants;
        private LayoutConfigurationDTO layoutConfiguration;
        private LocalDateTime createdAt;
        private String createdBy;
        private LocalDateTime updatedAt;
        private String updatedBy;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank
        @Size(min = 1, max = 255)
        private String name;
        
        @Size(max = 2000)
        private String description;
        
        @NotBlank
        private String ownerId;
        
        private LayoutConfigurationDTO layoutConfiguration;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        @Size(min = 1, max = 255)
        private String name;
        
        @Size(max = 2000)
        private String description;
        
        private LayoutConfigurationDTO layoutConfiguration;
    }
}
