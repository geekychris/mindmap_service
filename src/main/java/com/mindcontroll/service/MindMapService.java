package com.mindcontroll.service;

import com.mindcontroll.entity.MindMap;
import com.mindcontroll.entity.User;
import com.mindcontroll.repository.MindMapRepository;
import com.mindcontroll.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MindMapService {
    
    private final MindMapRepository mindMapRepository;
    private final UserRepository userRepository;
    
    public Page<MindMap> getAllMindMaps(String ownerId, String participantId, Pageable pageable) {
        if (ownerId != null) {
            return mindMapRepository.findByOwnerId(ownerId, pageable);
        } else if (participantId != null) {
            return mindMapRepository.findByParticipantUserId(participantId, pageable);
        }
        return mindMapRepository.findAll(pageable);
    }
    
    public MindMap getMindMapById(String id) {
        return mindMapRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("MindMap not found with id: " + id));
    }
    
    public MindMap createMindMap(MindMap mindMap, String ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + ownerId));
        
        mindMap.setOwner(owner);
        mindMap.setCreatedBy(ownerId);
        return mindMapRepository.save(mindMap);
    }
    
    public MindMap updateMindMap(String id, MindMap updates, String userId) {
        MindMap existing = getMindMapById(id);
        
        if (updates.getName() != null) {
            existing.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }
        if (updates.getLayoutConfiguration() != null) {
            existing.setLayoutConfiguration(updates.getLayoutConfiguration());
        }
        
        existing.setUpdatedBy(userId);
        return mindMapRepository.save(existing);
    }
    
    public void deleteMindMap(String id) {
        if (!mindMapRepository.existsById(id)) {
            throw new EntityNotFoundException("MindMap not found with id: " + id);
        }
        mindMapRepository.deleteById(id);
    }
    
    public Page<MindMap> searchMindMaps(String query, Pageable pageable) {
        return mindMapRepository.searchByNameOrDescription(query, pageable);
    }
}
