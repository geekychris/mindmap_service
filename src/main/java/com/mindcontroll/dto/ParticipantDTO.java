package com.mindcontroll.dto;

import com.mindcontroll.entity.Participant;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class ParticipantDTO {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private UserDTO.Response user;
        private Participant.Permission permission;
        private LocalDateTime addedAt;
        private String addedBy;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank
        private String userId;
        private Participant.Permission permission = Participant.Permission.EDIT;
    }
}
