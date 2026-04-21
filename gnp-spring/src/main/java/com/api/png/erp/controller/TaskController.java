package com.api.png.erp.controller;

import com.api.png.erp.entity.Task;
import com.api.png.erp.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        
        // Data Sanitization: Ensure no fields are null before sending to React
        tasks.forEach(t -> {
            if (t.getAssignedTo() == null) {
                t.setAssignedTo(""); 
            }
        });
        
        return tasks;
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Integer id, @RequestBody Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        task.setStatus(taskDetails.getStatus());
        task.setLastAction(taskDetails.getLastAction());
        
        return taskRepository.save(task);
    }
}