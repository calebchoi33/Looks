# LooksMaxx

A web application that allows users to manage their accounts and access their camera.

## Features
- User authentication (sign up, sign in, sign out)
- Account management (create, read, update, delete)
- Camera access functionality
- Containerized with Docker
- Kubernetes deployment ready

## Tech Stack
- Backend: FastAPI
- Frontend: HTML, CSS, JavaScript
- Database: PostgreSQL
- Container: Docker
- Orchestration: Kubernetes

## Setup Instructions
1. Install Docker and Kubernetes
2. Build the Docker image: `docker build -t looksmaxx .`
3. Apply Kubernetes configurations: `kubectl apply -f k8s/`
4. Access the application at `localhost:8000`
