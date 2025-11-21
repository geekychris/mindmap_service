package com.mindcontroll.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tag {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    private String color;
    
    private String mindmapId;
    
    private Boolean isStandard = false;
    
    private Integer usageCount = 0;
}
