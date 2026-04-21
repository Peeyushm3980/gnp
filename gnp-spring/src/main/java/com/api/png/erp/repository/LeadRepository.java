package com.api.png.erp.repository;

import com.api.png.erp.entity.ClientLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeadRepository extends JpaRepository<ClientLead, Integer> {
}