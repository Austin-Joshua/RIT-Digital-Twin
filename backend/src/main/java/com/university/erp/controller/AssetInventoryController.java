package com.university.erp.controller;

import com.university.erp.entity.AssetInventory;
import com.university.erp.repository.AssetInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*")
public class AssetInventoryController {

    @Autowired
    private AssetInventoryRepository repository;

    @GetMapping
    public List<AssetInventory> getAllAssets() {
        return repository.findAll();
    }

    @PostMapping
    public AssetInventory createAsset(@RequestBody AssetInventory asset) {
        return repository.save(asset);
    }
}
