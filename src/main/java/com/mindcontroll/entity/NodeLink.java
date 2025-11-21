package com.mindcontroll.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "node_links")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NodeLink {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String mindmapId;
    
    @Column(nullable = false)
    private String sourceNodeId;
    
    @Column(nullable = false)
    private String targetNodeId;
    
    @Column(nullable = false)
    private String linkType;
    
    private String label;
    
    private Boolean bidirectional = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private String createdBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
