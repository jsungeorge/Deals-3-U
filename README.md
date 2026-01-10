# ❤️ Deals-3-U: Automated Price Tracker 

> **A full-stack distributed system that automates price tracking on Amazon, built to help students survive high tuition costs.**

![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue) ![Puppeteer](https://img.shields.io/badge/Puppeteer-Scraping-green) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-orange) ![Status](https://img.shields.io/badge/Status-Stable-success)

## 📖 The Story
As an international student at the **University of Waterloo**, managing finances is a survival skill. With tuition fees being what they are, I realized I was wasting hours manually checking Amazon for price drops on textbooks and tech essentials.

I didn't want a browser extension that only works when I'm online. I wanted a **"set and forget" engine**—something that runs in the cloud, watches products 24/7, and pings me the second a price drops.

What started as a simple script turned into a deep dive into **cloud infrastructure, distributed systems, and anti-bot evasion techniques**.

---

## Key Features
* **24/7 Automated Scanning:** Uses a "Heartbeat" system where GitHub Actions wakes up the Render server hourly to scan products.
* **Custom Thresholds:** Users set a "Target Price" (e.g., "Notify me when this drops by 15%").
* **Smart Scraping Engine:** A Puppeteer-based scraper optimized for low-memory environments.
* **Historical Tracking:** Tracks initial vs. current price to calculate real savings.
* **User Dashboard:** A clean MERN-stack frontend to manage tracked items.

---

## Tech Stack
* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** Node.js, Express, REST API
* **Database:** MongoDB Atlas (Cloud)
* **Scraper:** Puppeteer (Headless Chrome)
* **DevOps/Infra:**
    * **Render:** Cloud Hosting (Web Service)
    * **GitHub Actions:** Cron Job Scheduler (The "Trigger")
    * **Docker:** Containerization constraints

---

## Technical Challenges & Solutions
Building a scraper is easy. Building a *reliable* scraper on a **Free Tier Cloud Server** with 512MB RAM is a war. Here are the biggest hurdles I overcame:

### 1. The "Memory Crisis" (OOM Crashes)
**The Problem:** Running Headless Chrome consumes ~400MB+ RAM. Render's free tier limit is 512MB. Opening just two tabs in parallel caused the server to crash immediately with `Error: Instance failed: Ran out of memory`.
**The Solution:**
* **Strict Serial Processing:** Abandoned parallel `Promise.all` batching in favor of a stable, sequential loop.
* **Resource Blocking:** Implemented Request Interception to block images, fonts, and stylesheets, reducing scraping memory footprint by ~50%.
* **Docker Flags:** Tuned Puppeteer launch args (`--disable-dev-shm-usage`, `--no-sandbox`) to survive inside a constrained Docker container.

### 2. The "30-Second Death" (Timeouts)
**The Problem:** Cloud servers can be slow. A standard 30-second timeout often failed when Amazon's pages were heavy, causing the scan to abort mid-process.
**The Solution:**
* Increased navigation timeouts to **90 seconds** to accommodate network latency.
* Implemented error handling that logs a failure for one product without crashing the entire batch scan.

### 3. The Firewall Wall (Email Notifications)
**The Problem:** The application logic for sending emails via `Nodemailer` is fully implemented and tested locally. However, cloud providers (like Render) block outbound traffic on SMTP ports (25, 465, 587) to prevent spam.
**The Outcome:**
* The system successfully detects deals and logs `🎉 DEAL FOUND` in the database.
* Email delivery is currently restricted by infrastructure limits. (Future fix: Integrate SendGrid API to bypass SMTP restrictions).

### 4. The "Sleepy Server" (Cold Starts)
**The Problem:** Free tier servers "spin down" after inactivity. A standard `setInterval` in Node.js would die when the server slept.
**The Solution:**
* Decoupled the scheduler from the application. I used **GitHub Actions** as an external "Cron Job" that sends a secure HTTP request to the server every hour, forcing it to wake up and run the scan.

---

## How It Works (Architecture)

1.  **Trigger:** GitHub Actions runs a cron job: `0 * * * *` (Hourly).
2.  **Wake Up:** It sends a `POST /api/cron/scan` request with a secure `CRON_SECRET` key.
3.  **Scrape:** The Express server launches Puppeteer, visits Amazon, and scrapes the price.
4.  **Analyze:**
    * `If (Current Price < Target Price) -> Deal Found`
    * `If (Deal Found) -> Update Database & Attempt Alert`
5.  **Sleep:** The server goes back to idle to save resources.

## Future Improvements
* **Proxy Rotation:** To prevent Amazon from rate-limiting the scraper during high-volume scans.
* **Email API Integration:** Switch from SMTP (Nodemailer) to SendGrid/Mailgun to bypass cloud firewalls.
* **SMS Alerts:** Integration with Twilio for instant text notifications.
