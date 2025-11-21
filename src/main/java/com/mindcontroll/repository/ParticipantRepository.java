package com.mindcontroll.repository;

import com.mindcontroll.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {
    
    List<Participant> findByMindMapId(String mindMapId);
    
    void deleteByMindMapIdAndId(String mindMapId, String id);
}
