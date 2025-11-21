package com.mindcontroll.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mindmap_id", nullable = false)
    private MindMap mindMap;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Permission permission = Permission.EDIT;
    
    @Column(nullable = false)
    private LocalDateTime addedAt;
    
    @Column(nullable = false)
    private String addedBy;
    
    public enum Permission {
        VIEW, EDIT, ADMIN
    }
    
    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}
