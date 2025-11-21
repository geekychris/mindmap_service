package com.mindcontroll.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NodePosition {
    
    private Float x;
    
    private Float y;
    
    private Boolean isFixed = false;
}
