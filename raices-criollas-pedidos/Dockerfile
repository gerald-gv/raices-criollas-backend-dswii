
# ETAPA 1: Compilar el proyecto Spring Boot
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ETAPA 2: Ejecutar la aplicación compilada
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/raices-criollas-pedidos-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
