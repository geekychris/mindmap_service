package com.mindcontroll.repository;

import com.mindcontroll.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, String> {
    
    List<Tag> findByMindmapId(String mindmapId);
    
    List<Tag> findByMindmapIdIsNull();
    
    @Query("SELECT t FROM Tag t WHERE " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Tag> searchByName(@Param("search") String search);
    
    List<Tag> findByMindmapIdAndIsStandard(String mindmapId, Boolean isStandard);
}
