package com.mindcontroll.repository;

import com.mindcontroll.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
    
    Page<Comment> findByNodeId(String nodeId, Pageable pageable);
    
    List<Comment> findByNodeIdAndParentCommentIdIsNull(String nodeId);
    
    List<Comment> findByParentCommentId(String parentCommentId);
    
    @Query("SELECT c FROM Comment c WHERE c.nodeId IN " +
           "(SELECT n.id FROM Node n WHERE n.mindmapId = :mindmapId) AND " +
           "LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Comment> searchInMindMap(@Param("mindmapId") String mindmapId, 
                                   @Param("query") String query, 
                                   Pageable pageable);
}
