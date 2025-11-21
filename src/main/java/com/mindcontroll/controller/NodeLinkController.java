package com.mindcontroll.controller;

import com.mindcontroll.entity.NodeLink;
import com.mindcontroll.repository.NodeLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/mindmaps/{mindmapId}/links")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class NodeLinkController {
    
    private final NodeLinkRepository nodeLinkRepository;
    
    @GetMapping
    public ResponseEntity<List<NodeLink>> getLinksByMindMap(@PathVariable String mindmapId) {
        List<NodeLink> links = nodeLinkRepository.findByMindmapId(mindmapId);
        return ResponseEntity.ok(links);
    }
    
    @PostMapping
    public ResponseEntity<NodeLink> createLink(
            @PathVariable String mindmapId,
            @RequestBody CreateLinkRequest request) {
        
        NodeLink link = new NodeLink();
        link.setId(UUID.randomUUID().toString());
        link.setMindmapId(mindmapId);
        link.setSourceNodeId(request.getSourceNodeId());
        link.setTargetNodeId(request.getTargetNodeId());
        link.setLinkType(request.getLinkType());
        link.setLabel(request.getLabel());
        link.setCreatedAt(LocalDateTime.now());
        link.setCreatedBy("system");
        
        NodeLink saved = nodeLinkRepository.save(link);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{linkId}")
    public ResponseEntity<NodeLink> updateLink(
            @PathVariable String mindmapId,
            @PathVariable String linkId,
            @RequestBody UpdateLinkRequest request) {
        
        return nodeLinkRepository.findById(linkId)
                .map(link -> {
                    if (request.getLinkType() != null) {
                        link.setLinkType(request.getLinkType());
                    }
                    if (request.getLabel() != null) {
                        link.setLabel(request.getLabel());
                    }
                    return ResponseEntity.ok(nodeLinkRepository.save(link));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{linkId}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable String mindmapId,
            @PathVariable String linkId) {
        if (nodeLinkRepository.existsById(linkId)) {
            nodeLinkRepository.deleteById(linkId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @lombok.Data
    public static class CreateLinkRequest {
        private String sourceNodeId;
        private String targetNodeId;
        private String linkType;
        private String label;
    }
    
    @lombok.Data
    public static class UpdateLinkRequest {
        private String linkType;
        private String label;
    }
}
