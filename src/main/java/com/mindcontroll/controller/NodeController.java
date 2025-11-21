package com.mindcontroll.controller;

import com.mindcontroll.entity.Node;
import com.mindcontroll.entity.NodePosition;
import com.mindcontroll.repository.MindMapRepository;
import com.mindcontroll.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/mindmaps/{mindmapId}/nodes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class NodeController {
    
    private final NodeRepository nodeRepository;
    private final MindMapRepository mindMapRepository;
    
    @GetMapping
    public ResponseEntity<List<Node>> getNodesByMindMap(@PathVariable String mindmapId) {
        List<Node> nodes = nodeRepository.findByMindmapId(mindmapId);
        return ResponseEntity.ok(nodes);
    }
    
    @GetMapping("/{nodeId}")
    public ResponseEntity<Node> getNodeById(
            @PathVariable String mindmapId,
            @PathVariable String nodeId) {
        return nodeRepository.findById(nodeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Node> createNode(
            @PathVariable String mindmapId,
            @RequestBody CreateNodeRequest request) {
        
        // Verify mindmap exists
        if (!mindMapRepository.existsById(mindmapId)) {
            return ResponseEntity.notFound().build();
        }
        
        Node node = new Node();
        node.setId(UUID.randomUUID().toString());
        node.setMindmapId(mindmapId);
        node.setTitle(request.getTitle());
        node.setDescription(request.getDescription());
        node.setColor(request.getColor());
        node.setParentId(request.getParentId());
        
        if (request.getPosition() != null) {
            NodePosition position = new NodePosition();
            position.setX((float) request.getPosition().getX());
            position.setY((float) request.getPosition().getY());
            position.setIsFixed(false);
            node.setPosition(position);
        }
        
        node.setCreatedAt(LocalDateTime.now());
        node.setCreatedBy("system"); // TODO: Get from security context
        
        Node saved = nodeRepository.save(node);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{nodeId}")
    public ResponseEntity<Node> updateNode(
            @PathVariable String mindmapId,
            @PathVariable String nodeId,
            @RequestBody UpdateNodeRequest request) {
        
        return nodeRepository.findById(nodeId)
                .map(node -> {
                    if (request.getTitle() != null) {
                        node.setTitle(request.getTitle());
                    }
                    if (request.getDescription() != null) {
                        node.setDescription(request.getDescription());
                    }
                    if (request.getColor() != null) {
                        node.setColor(request.getColor());
                    }
                    if (request.getParentId() != null) {
                        node.setParentId(request.getParentId());
                    }
                    if (request.getPosition() != null) {
                        NodePosition position = node.getPosition();
                        if (position == null) {
                            position = new NodePosition();
                        }
                        position.setX((float) request.getPosition().getX());
                        position.setY((float) request.getPosition().getY());
                        node.setPosition(position);
                    }
                    node.setUpdatedAt(LocalDateTime.now());
                    node.setUpdatedBy("system");
                    return ResponseEntity.ok(nodeRepository.save(node));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{nodeId}")
    public ResponseEntity<Void> deleteNode(
            @PathVariable String mindmapId,
            @PathVariable String nodeId) {
        if (nodeRepository.existsById(nodeId)) {
            nodeRepository.deleteById(nodeId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // DTOs
    @lombok.Data
    public static class CreateNodeRequest {
        private String title;
        private String description;
        private String color;
        private String parentId;
        private PositionDTO position;
    }
    
    @lombok.Data
    public static class UpdateNodeRequest {
        private String title;
        private String description;
        private String color;
        private String parentId;
        private PositionDTO position;
    }
    
    @lombok.Data
    public static class PositionDTO {
        private double x;
        private double y;
    }
}
