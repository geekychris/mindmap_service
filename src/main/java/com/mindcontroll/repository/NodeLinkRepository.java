package com.mindcontroll.repository;

import com.mindcontroll.entity.NodeLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NodeLinkRepository extends JpaRepository<NodeLink, String> {
    
    List<NodeLink> findByMindmapId(String mindmapId);
    
    List<NodeLink> findBySourceNodeId(String sourceNodeId);
    
    List<NodeLink> findByTargetNodeId(String targetNodeId);
    
    List<NodeLink> findByMindmapIdAndLinkType(String mindmapId, String linkType);
}
