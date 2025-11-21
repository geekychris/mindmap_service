package com.mindcontroll.repository;

import com.mindcontroll.entity.MindMap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MindMapRepository extends JpaRepository<MindMap, String> {
    
    Page<MindMap> findByOwnerId(String ownerId, Pageable pageable);
    
    @Query("SELECT DISTINCT m FROM MindMap m LEFT JOIN m.participants p " +
           "WHERE p.user.id = :userId")
    Page<MindMap> findByParticipantUserId(@Param("userId") String userId, Pageable pageable);
    
    @Query("SELECT m FROM MindMap m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<MindMap> searchByNameOrDescription(@Param("query") String query, Pageable pageable);
}
