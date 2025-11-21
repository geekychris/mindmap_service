package com.mindcontroll.repository;

import com.mindcontroll.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {
    
    List<Attachment> findByNodeId(String nodeId);
}
