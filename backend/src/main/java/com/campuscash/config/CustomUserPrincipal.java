package com.campuscash.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.security.Principal;

@Getter
@AllArgsConstructor
public class CustomUserPrincipal implements Principal {
    private final Long id;
    private final String email;

    @Override
    public String getName() {
        return email;
    }
}
