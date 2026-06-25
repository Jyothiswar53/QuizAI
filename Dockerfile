FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "target/quiz-ai-0.0.1-SNAPSHOT.jar"]