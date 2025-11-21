package com.mindcontroll.controller;

import com.mindcontroll.dto.MindMapDTO;
import com.mindcontroll.dto.PageResponse;
import com.mindcontroll.entity.MindMap;
import com.mindcontroll.service.MindMapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mindmaps")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class MindMapController {
    
    private final MindMapService mindMapService;
    
    @GetMapping
    public ResponseEntity<PageResponse<MindMap>> getAllMindMaps(
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) String participant,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        
        Pageable pageable = createPageable(page, size, sort);
        Page<MindMap> mindMaps = mindMapService.getAllMindMaps(owner, participant, pageable);
        return ResponseEntity.ok(PageResponse.of(mindMaps));
    }
    
    @GetMapping("/{mindmapId}")
    public ResponseEntity<MindMap> getMindMapById(@PathVariable String mindmapId) {
        MindMap mindMap = mindMapService.getMindMapById(mindmapId);
        return ResponseEntity.ok(mindMap);
    }
    
    @PostMapping
    public ResponseEntity<MindMap> createMindMap(@Valid @RequestBody MindMapDTO.CreateRequest request) {
        MindMap mindMap = new MindMap();
        mindMap.setName(request.getName());
        mindMap.setDescription(request.getDescription());
        
        MindMap created = mindMapService.createMindMap(mindMap, request.getOwnerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{mindmapId}")
    public ResponseEntity<MindMap> updateMindMap(
            @PathVariable String mindmapId,
            @Valid @RequestBody MindMapDTO.UpdateRequest request) {
        
        MindMap updates = new MindMap();
        updates.setName(request.getName());
        updates.setDescription(request.getDescription());
        
        // Handle layout configuration update
        if (request.getLayoutConfiguration() != null) {
            com.mindcontroll.entity.LayoutConfiguration layoutConfig = new com.mindcontroll.entity.LayoutConfiguration();
            layoutConfig.setLayoutType(request.getLayoutConfiguration().getLayoutType());
            layoutConfig.setZoom(request.getLayoutConfiguration().getZoom());
            layoutConfig.setCenterX(request.getLayoutConfiguration().getCenterX());
            layoutConfig.setCenterY(request.getLayoutConfiguration().getCenterY());
            layoutConfig.setTreeOrientation(request.getLayoutConfiguration().getTreeOrientation());
            layoutConfig.setNodeSpacing(request.getLayoutConfiguration().getNodeSpacing());
            layoutConfig.setLevelSpacing(request.getLayoutConfiguration().getLevelSpacing());
            updates.setLayoutConfiguration(layoutConfig);
        }
        
        // For simplicity, using a hardcoded user ID. In production, this would come from security context
        MindMap updated = mindMapService.updateMindMap(mindmapId, updates, "system");
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{mindmapId}")
    public ResponseEntity<Void> deleteMindMap(@PathVariable String mindmapId) {
        mindMapService.deleteMindMap(mindmapId);
        return ResponseEntity.noContent().build();
    }
    
    private Pageable createPageable(int page, int size, String sort) {
        if (sort != null && !sort.isEmpty()) {
            String[] sortParams = sort.split(",");
            String property = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            return PageRequest.of(page, size, Sort.by(direction, property));
        }
        return PageRequest.of(page, size);
    }
}
