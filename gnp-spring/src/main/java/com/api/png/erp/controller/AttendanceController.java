package com.api.png.erp.controller;

import com.api.png.erp.entity.Attendance;
import com.api.png.erp.repository.AttendanceRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository repository;

    public AttendanceController(AttendanceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Attendance> getAttendance() {
        return repository.findAll();
    }

    @PostMapping
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return repository.save(attendance);
    }
}