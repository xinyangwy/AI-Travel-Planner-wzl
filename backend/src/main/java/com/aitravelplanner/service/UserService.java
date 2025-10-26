package com.aitravelplanner.service;

import com.aitravelplanner.model.User;

public interface UserService {

    User register(User user, String password);
    User login(String username, String password);
    User getById(Long id);
    User updateProfile(Long id, User user);
    User findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}