# Flag Color Guessing Game

Simple web app where players test their knowledge of world flags by filling in the correct colors.

## Features & Game Modes

* **Daily:** A single, synchronized flag puzzle updated daily for all players worldwide.
* **Regular:** Standard gameplay where you fill in the correct colors with the country name displayed.
* **Hard:** Same as Regular mode, but the country name is hidden.
* **Scrambled:** The shape regions of the flag are mixed up across different parts of the canvas.
* **Random:** Instead of starting with a black-and-white base, the flag is pre-filled with completely random colors.
* **Custom:** Configure your own match parameters, including custom flag selections and an optional countdown timer.

## Known Issues

* **SVG Path Processing Bug:** Some flag vectors contain unregistered or overlapping color regions due to original SVG path complexity. As a result, certain small sections or strokes may not register properly during color selection or may count as unintended separate regions. Path parsing fixes are in progress.

## Asset Attribution

* Original flag SVG files are sourced from the [flag-icons](https://github.com/lipis/flag-icons) repository.

## Tech Stack & Project Structure

* **Frontend:** React + TypeScript (powered by Vite)
* **Backend:** Java Spring Boot + Maven

```text
.
├── frontend/    # React + TypeScript (Vite)
└── backend/     # Java Spring Boot + Maven


## Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* Java Development Kit (JDK 17+)
* Maven (or the included Maven wrapper)

### Installation & Local Setup

1. **Clone the repository:**
```bash
git clone [https://github.com/your-username/flag-color-game.git](https://github.com/your-username/flag-color-game.git)
cd flag-color-game

```


2. **Start the Backend:**
```bash
cd backend
./mvnw spring-boot:run

```


The Spring Boot server will start on `http://localhost:8080`.
3. **Start the Frontend:**
```bash
cd frontend
npm install
npm run dev

```

Open the local URL displayed in your terminal (typically `http://localhost:5173`).
