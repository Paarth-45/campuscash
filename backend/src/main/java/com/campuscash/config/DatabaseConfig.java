package com.campuscash.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Production Database Configuration
 * Gracefully parses standard JDBC URLs as well as Cloud PaaS (Render / Heroku / Supabase)
 * connection strings in the format postgres://user:pass@host:port/database.
 */
@Slf4j
@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        String jdbcUrl = rawUrl;
        String dbUser = username;
        String dbPass = password;

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(rawUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath(); // e.g. /campuscash
                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    dbUser = parts[0];
                    if (parts.length > 1) {
                        dbPass = parts[1];
                    }
                }
                log.info("Converted cloud PostgreSQL URL to standard JDBC format: {}", jdbcUrl);
            } catch (Exception e) {
                log.warn("Could not parse cloud PostgreSQL URI, falling back to raw URL: {}", e.getMessage());
            }
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(dbUser);
        ds.setPassword(dbPass);
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setMaximumPoolSize(5); // Conservative connection pool size optimized for 512MB RAM tier
        ds.setMinimumIdle(2);
        ds.setIdleTimeout(30000);
        ds.setMaxLifetime(60000);
        ds.setConnectionTimeout(30000);
        return ds;
    }
}
