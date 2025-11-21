package com.mindcontroll.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExifData {
    
    private Integer width;
    
    private Integer height;
    
    private String cameraMake;
    
    private String cameraModel;
    
    private LocalDateTime dateTaken;
    
    private Double latitude;
    
    private Double longitude;
    
    private Integer orientation;
    
    private Integer iso;
    
    private String aperture;
    
    private String exposureTime;
    
    private String focalLength;
}
