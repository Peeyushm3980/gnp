package com.api.png.erp.repository;

import com.api.png.erp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    // Standard CRUD methods like save() and findAll() are automatically provided
}