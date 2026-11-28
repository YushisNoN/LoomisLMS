package com.loomis.lms.loomislmsbackend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisConfig implements CommandLineRunner {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public void run(String... args) {
        redisTemplate.opsForValue().set("loomis:test", "Redis connected");
        String result = redisTemplate.opsForValue().get("loomis:test");
        System.out.println("Redis test: " + result);
    }
}