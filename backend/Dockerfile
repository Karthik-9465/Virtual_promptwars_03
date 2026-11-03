# Stage 1: Build the Spring Boot application using Maven & Java 21
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper & POM files for caching
COPY pom.xml .
COPY src ./src

# Build the application JAR package
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

# Stage 2: Production runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add unprivileged user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose server port (configured via PORT environment variable, defaults to 8080)
EXPOSE 8080

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

# Launch Spring Boot with optimized JVM memory flags
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar"]

