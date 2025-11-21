package com.mindcontroll.repository;

import com.mindcontroll.entity.Node;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node, String> {
    
    Page<Node> findByMindmapId(String mindmapId, Pageable pageable);
    
    Page<Node> findByMindmapIdAndParentId(String mindmapId, String parentId, Pageable pageable);
    
    List<Node> findByMindmapId(String mindmapId);
    
    @Query("SELECT n FROM Node n WHERE n.mindmapId = :mindmapId AND " +
           ":tag MEMBER OF n.tags")
    Page<Node> findByMindmapIdAndTag(@Param("mindmapId") String mindmapId, 
                                      @Param("tag") String tag, 
                                      Pageable pageable);
    
    @Query("SELECT n FROM Node n WHERE n.mindmapId = :mindmapId AND (" +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Node> searchInMindMap(@Param("mindmapId") String mindmapId, 
                                @Param("query") String query, 
                                Pageable pageable);
    
    @Query("SELECT n FROM Node n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Node> searchAcrossAllMindMaps(@Param("query") String query, Pageable pageable);
}
