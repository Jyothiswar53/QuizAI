<div align="center">

# 🤖 QuizAI

### AI-Powered Quiz Platform built with Spring Boot, Gemini AI, JWT Authentication & MySQL

Generate quizzes on any topic using Google Gemini AI, attempt randomized quizzes, track performance, compete on the leaderboard, and manage the platform through an Admin Dashboard.

<br>

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6-success?style=for-the-badge&logo=springsecurity)](https://spring.io/projects/spring-security)
[![MySQL](https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-blueviolet?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render)](https://render.com/)
[![Clever Cloud](https://img.shields.io/badge/Clever_Cloud-MySQL_DB-orange?style=for-the-badge)](https://www.clever-cloud.com/)

</div>

---

# 🌐 Live Demo

### 🚀 Live Application

👉 https://quizai-plfs.onrender.com
---

# 📖 Overview

QuizAI is a full-stack AI-powered quiz platform that dynamically generates quizzes using Google's Gemini AI. Users can create quizzes on any topic, attempt randomized questions, view detailed results, monitor previous attempts, and compete on a global leaderboard.

The platform includes secure JWT authentication, Role-Based Access Control (RBAC), AI question caching, and an Admin Dashboard for platform management.

---

# 🚀 Highlights

- 🤖 AI-generated quizzes using Google Gemini 2.5 Flash
- 🔐 Secure JWT Authentication & RBAC
- 🏆 Leaderboard System
- 📊 Admin Dashboard
- 🗄️ MySQL Database
- 🐳 Dockerized Application
- ☁️ Deployed on Render
- 🌍 External MySQL using Clever Cloud

---

# ✨ Key Features

## 👤 Authentication

- User Registration
- Secure Login
- JWT Authentication
- BCrypt Password Encryption
- Role-Based Access Control (USER / ADMIN)

---

# 🏗 Architecture

```
                 Browser
                     │
                     ▼
       HTML • Bootstrap • JavaScript
                     │
                     ▼
          Spring Boot REST APIs
                     │
                     ▼
      Spring Security + JWT Authentication
                     │
                     ▼
              Service Layer
                     │
                     ▼
            Repository Layer
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
     MySQL Database        Gemini AI API
```

---

## 🤖 AI Quiz Generation

Generate quizzes on any topic using **Google Gemini AI**.

Users can select

- Topic
- Difficulty (Easy / Medium / Hard)
- Number of Questions

Supported Question Counts

- 5
- 10
- 15
- 20

---

## 📝 Quiz System

- AI-generated MCQs
- Randomized Questions
- Automatic Score Evaluation
- Percentage Calculation
- Time Tracking
- Quiz History
- AI Question Caching
- Duplicate Question Prevention

---

## 🏆 Leaderboard

- Global Rankings
- Highest Scores
- Performance Comparison

---

## 👨‍💼 Admin Dashboard

- View Total Users
- View Total Quizzes
- View Total Questions
- Platform Statistics
- Quiz Statistics
- Topic Statistics
- User Quiz History
- Delete Users

---

# 🛠 Tech Stack

## Backend

- Java 17
- Spring Boot 3.3
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven

---

## Frontend

- HTML
- CSS
- JavaScript
---

## Database

- MySQL
- Clever Cloud

---

## Artificial Intelligence

- Google Gemini API
- Gemini 2.5 Flash

---

## Deployment

- Docker
- Render
- Clever Cloud (External MySQL)

---


# 🗄 Database Design

The application uses **4 relational tables**.

- Users
- Questions
- Quizzes
- Quiz Attempts

The database is designed to eliminate duplicate AI-generated questions by storing generated questions and reusing them whenever possible.

---

# 🔐 Security

- JWT Authentication
- BCrypt Password Encryption
- Role-Based Access Control
- Protected REST APIs
- Input Validation using Bean Validation
- DTO-based Request/Response Layer

---

# 📡 REST APIs

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

---

## Quiz

```
POST /api/quiz/generate
POST /api/quiz/submit
GET  /api/quiz/history
```

---

## Leaderboard

```
GET /api/leaderboard
```

---

## Admin

```
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/users/{id}/history
DELETE /api/admin/users/{id}
```

---

# 📸 Screenshots

## 🏠 Home Page

![Home](screenshots/home.png)

---

## 🔐 Login

![Login](screenshots/login.png)

---

## 📝 Register

![Register](screenshots/register.png)

---

## 📊 Dashboard

![Dashboard](screenshots/dashboard.png)

---

## 🎯 Quiz Setup

![Quiz Setup](screenshots/quizsetup.png)

---

## 📈 Quiz Result

![Result](screenshots/result.png)

---

## 🏆 Leaderboard

![Leaderboard](screenshots/leaderboard.png)

---

## 👨‍💼 Admin Dashboard

![Admin](screenshots/admin.png)
---

# 🧪 API Testing

All REST APIs were tested using **Postman**.

The application contains **19 REST API endpoints** covering

- Authentication
- Quiz Generation
- Quiz Submission
- Quiz History
- Leaderboard
- Admin Management

---


# 👨‍💻 Author

## Jyothiswar Yalla

📧 Email

yallajyothiswar@gmail.com

🔗 GitHub

https://github.com/Jyothiswar53

💼 LinkedIn

https://www.linkedin.com/in/jyothiswar66/

🌐 Portfolio

https://jyothiswar53.github.io/PORTFOLIO/

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

It helps others discover the project and motivates future improvements.

---

<div align="center">

### Thank you for visiting QuizAI ❤️

Built with Java, Spring Boot, MySQL, Docker & Google Gemini AI.

</div>
