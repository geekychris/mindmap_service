package com.mindcontroll.dto;

import com.mindcontroll.entity.LayoutConfiguration;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LayoutConfigurationDTO {
    private LayoutConfiguration.LayoutType layoutType;
    private Float zoom;
    private Float centerX;
    private Float centerY;
    private LayoutConfiguration.TreeOrientation treeOrientation;
    private Float nodeSpacing;
    private Float levelSpacing;
}
