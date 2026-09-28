# Flag Color Guessing Game

Simple web app where players test their knowledge of world flags by filling in the correct colors.

## Features & Game Modes

* **Daily:** A single, synchronized flag puzzle updated daily for all players worldwide.
* **Regular:** Standard gameplay where you fill in the correct colors with the country name displayed.
* **Hard:** Same as Regular mode, but the country name is hidden.
* **Scrambled:** The colors of the regions are mixed up.
* **Random:** Instead of starting with a black-and-white base, the flag is pre-filled with completely random colors.
* **Custom:** Configure your own match parameters, including custom flag selections and an optional countdown timer.

## Known Issues

* **SVG Processing Bug:** Some flag vectors contain unregistered or overlapping color regions. As a result, certain sections or strokes may not register properly resulting in colored regions, that are not part of the game.

## Tech Stack & Project Structure

* **Frontend:** React + TypeScript
* **Backend:** Java Spring Boot + Maven

## Getting Started

### Prerequisites

* Node.js
* React (TypeScript)
* Java
* Maven

### Installation & Local Setup

1. **Clone or Download the repository**


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

## Attribution

* Original flag SVG files are sourced from the [country-flags](https://github.com/hampusborgos/country-flags) repository.

