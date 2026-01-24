# 🌱 GreenIQ – Sustainable Living, Climate Awareness, and Immediate Action

GreenIQ is an AI-powered mobile application designed to empower individuals to live sustainably, understand environmental risks, and **take immediate action in response to climate-related dangers**. The platform transforms daily behaviors—such as waste disposal, product consumption, and location awareness—into meaningful contributions toward **climate resilience and environmental safety**.

GreenIQ directly aligns with **UN Sustainable Development Goal 13 (Climate Action)**, with a strong focus on **education, awareness, and actionable response (SDG 13)**.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Why GreenIQ Exists](#-why-greeniq-exists)
* [What Makes GreenIQ Different](#-what-makes-greeniq-different)
* [Key Features](#-key-features)
* [System Architecture](#-system-architecture)
* [AI & Core Algorithms](#-ai--core-algorithms)
* [Setup & Installation](#-setup--installation)
* [Environment Configuration](#-environment-configuration)
* [Deployment](#-deployment)
* [Contributing](#-contributing)
* [License](#-license)

---

## 🌍 Overview

Climate action is often viewed as a long-term, large-scale responsibility, but in reality, **individual behavior and immediate response to environmental risks play a critical role**. Recycling, responsible consumption, and disaster awareness reduce carbon emissions, limit pollution, and protect communities from climate-related threats.

GreenIQ provides a **single intelligent platform** that helps users:

* Understand what they consume
* Dispose of waste correctly
* Recognize environmental dangers
* Identify safe zones
* Take action immediately when risks arise

---

## ❗ Why GreenIQ Exists

In many developing countries, recycling and climate resilience efforts face serious challenges:

* Recycling rates below 10%
* Poor waste collection infrastructure
* Low public awareness
* Limited access to environmental data
* Lack of systems that translate awareness into action

---

## 🔍 What Makes GreenIQ Different

GreenIQ is not just a recycling app—it is a **climate intelligence and action platform**.

### 1. AI & Machine Learning
* **Local PyTorch Model**: For real-time waste classification.
* **DeepSeek API**: For advanced product analysis and disposal recommendations.

### 2. Full Lifecycle Awareness
* Product barcode scanning via Open Food Facts.
* Environmental grading using EcoScore.
* AI-generated disposal tips.

### 3. Climate Risk Awareness
* Safe zone mapping (hospitals, shelters).
* Location-based climate risk analysis.

### 4. Supply-Chain Integration
* Nearby collection point identification.
* Direct connection with recycling companies.

---

## ✨ Key Features

* AI-powered waste scanning
* Product barcode scanning with environmental grading
* Climate danger awareness & safe zone identification
* Location-based sustainability mapping
* EcoPoints, leaderboards, and rewards
* Waste collection & recycling supply-chain integration

---

## 🏗️ System Architecture

* **Frontend**: React Native (Expo)
* **AI**: PyTorch, DeepSeek API
* **Backend**: Node.js, MongoDB
* **Deployment**: Render.com

---

## 🤖 AI & Core Algorithms

### Waste Scanning Flow
`Image Capture` → `Model Classification` → `Disposal Tips` → `Rewards` → `Company Notification`

### Product Scanning Flow
`Barcode Scan` → `Open Food Facts` → `EcoScore` → `DeepSeek Analysis` → `User Display`

---

## 🛠️ Setup & Installation

### Prerequisites
* Node.js (v18+)
* Expo CLI
* Android Studio / Xcode (for simulators)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/rukundo-furaha-divin/Green-IQ.git
   cd Green-IQ-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your configuration file (see Environment Configuration below).

4. Start the development server:
   ```bash
   npx expo start
   ```

---

## 🔐 Environment Configuration

To run this project, you need to configure environment variables.

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your actual API keys:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   DEEPSEEK_API_KEY=your_deepseek_key
   API_BASE_URL=https://green-iq-backend-xsui.onrender.com
   ```

> **IMPORTANT for APK Builds**:
> When building an APK with EAS (`eas build`), `.env` files might not be loaded automatically in the cloud builder. You must set these variables in your **Expo Dashboard** under "Secrets" or define them in `eas.json` profiles.

---

## ☁️ Deployment

* **Backend**: Deployed on [Render](https://onrender.com).
* **Frontend**: Built with EAS Build for Android (`.apk`).

---

## 🤝 Contributing

Fork the repository, create a feature branch, and submit a pull request with clear documentation.

---

## 📄 License

MIT License
