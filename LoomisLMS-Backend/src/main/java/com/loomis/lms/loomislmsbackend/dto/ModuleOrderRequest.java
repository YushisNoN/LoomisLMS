package com.loomis.lms.loomislmsbackend.dto;
import java.util.List;
import java.util.UUID;

public record ModuleOrderRequest(
        List<UUID> moduleIds
) {}