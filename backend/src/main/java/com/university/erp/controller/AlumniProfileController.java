package com.university.erp.controller;

import com.university.erp.model.AlumniProfile;
import com.university.erp.repository.AlumniProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@CrossOrigin(origins = "*")
public class AlumniProfileController {

    @Autowired
    private AlumniProfileRepository repository;

    @GetMapping
    public List<AlumniProfile> getAllAlumni() {
        return repository.findAll();
    }

    @PostMapping
    public AlumniProfile createAlumni(@org.springframework.lang.NonNull @RequestBody AlumniProfile profile) {
        java.util.Objects.requireNonNull(profile, "profile must not be null");
        return repository.save(profile);
    }
}
