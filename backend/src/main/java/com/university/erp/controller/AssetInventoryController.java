package com.university.erp.controller;

import com.university.erp.entity.AssetInventory;
import com.university.erp.repository.AssetInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetInventoryController {

    @Autowired
    private AssetInventoryRepository repository;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SA','M')")
    public List<AssetInventory> getAllAssets() {
        return repository.findAll();
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN','SA','M')")
    public AssetInventory createAsset(@org.springframework.lang.NonNull @RequestBody AssetInventory asset) {
        java.util.Objects.requireNonNull(asset, "asset must not be null");
        return repository.save(asset);
    }
}
