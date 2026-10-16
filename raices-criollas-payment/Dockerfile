# Etapa 1: COMPILE
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# Etapa 2: RUNTIME
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/raices-criollas-payment-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]