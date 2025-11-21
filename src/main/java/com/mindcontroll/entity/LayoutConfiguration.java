package com.mindcontroll.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LayoutConfiguration {
    
    @Enumerated(EnumType.STRING)
    private LayoutType layoutType = LayoutType.AUTO;
    
    private Float zoom = 1.0f;
    
    private Float centerX;
    
    private Float centerY;
    
    @Enumerated(EnumType.STRING)
    private TreeOrientation treeOrientation;
    
    private Float nodeSpacing = 100.0f;
    
    private Float levelSpacing = 150.0f;
    
    public enum LayoutType {
        AUTO, XY_FIXED, XY_HYBRID, RADIAL, TREE
    }
    
    public enum TreeOrientation {
        TOP_DOWN, BOTTOM_UP, LEFT_RIGHT, RIGHT_LEFT
    }
}
