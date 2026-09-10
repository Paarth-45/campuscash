# Build stage with pre-installed Maven (avoids wrapper permissions & download latency)
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src src
RUN mvn clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl wget
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080 10000

# Container-aware memory limits (384MB heap ceiling) to reliably run within 512MB RAM free-tier limits
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Xmx384m", "-jar", "app.jar"]
