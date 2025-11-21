package com.mindcontroll.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "external_links")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExternalLink {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String url;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}
