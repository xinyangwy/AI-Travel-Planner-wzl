package com.aitravelplanner.service.impl;

import com.aitravelplanner.model.User;
import com.aitravelplanner.repository.UserRepository;
import com.aitravelplanner.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User register(User user, String password) {
        // 检查用户名、邮箱、手机号是否已存在
        if (existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (user.getEmail() != null && existsByEmail(user.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }
        if (user.getPhone() != null && existsByPhone(user.getPhone())) {
            throw new RuntimeException("手机号已被注册");
        }

        // 加密密码
        user.setPasswordHash(passwordEncoder.encode(password));

        return userRepository.save(user);
    }

    @Override
    public User login(String username, String password) {
        User user = findByUsername(username);
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("用户名或密码错误");
        }
        return user;
    }

    @Override
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Override
    @Transactional
    public User updateProfile(Long id, User user) {
        User existingUser = getById(id);
        
        // 更新非敏感信息
        if (user.getEmail() != null && !user.getEmail().equals(existingUser.getEmail())) {
            if (existsByEmail(user.getEmail())) {
                throw new RuntimeException("邮箱已被使用");
            }
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPhone() != null && !user.getPhone().equals(existingUser.getPhone())) {
            if (existsByPhone(user.getPhone())) {
                throw new RuntimeException("手机号已被使用");
            }
            existingUser.setPhone(user.getPhone());
        }
        if (user.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(user.getAvatarUrl());
        }
        if (user.getPreferences() != null) {
            existingUser.setPreferences(user.getPreferences());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }
}