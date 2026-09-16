package com.university.erp.repository;

import com.university.erp.model.ErpMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ErpMessageRepository extends JpaRepository<ErpMessage, Long> {
    List<ErpMessage> findByRecipient_IdOrderBySentAtDesc(Long recipientUserId);
    List<ErpMessage> findBySender_IdOrderBySentAtDesc(Long senderUserId);
    List<ErpMessage> findByRecipient_IdAndIsReadFalse(Long recipientUserId);
}
