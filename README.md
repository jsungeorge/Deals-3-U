# [Deals ❤️ U: Automated Price Tracker (Try It Live!)](https://deals-3-u.onrender.com)

> **A full-stack distributed system that automates price tracking on Amazon, built to make smart shopping fun and effortless.**

[![YouTube Demo](https://img.shields.io/badge/Demo-YouTube-red?logo=youtube)](https://www.youtube.com/watch?v=Sxl14re7uOA) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow) ![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-blue) ![Cheerio](https://img.shields.io/badge/Puppeteer-Web%20Scraping-green) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-orange)



---

## The Story
Let's be real: we all love the thrill of finding a great deal. There is nothing quite like the satisfaction of snagging that tech gadget or everyday essential right when the price dips. But constantly refreshing tabs to check for discounts? That takes all the fun out of it.

I built this project because I wanted to automate the hunt for that sweet deal. I wanted a tool that does the heavy lifting in the background, giving me a "set-and-forget" experience.

This project isn't just about saving money, it's about upgrading the purchasing experience. It's a fun, hassle-free way for me (and any other user) to track the items we want and get the best price without the hustle.

---

## Key Features
* **24/7 Automated Scanning:** Uses a "Heartbeat" system where GitHub Actions wakes up the Render server hourly to scan products.
* **Custom Thresholds:** Users set a "Target Price" (e.g., "Notify me when this drops by 15%").
* **Smart Scraping Engine:** A Puppeteer-based scraper optimized for low-memory environments.
* **Historical Tracking:** Tracks initial vs. current price to calculate real savings.
* **User Dashboard:** A clean, responsive dashboard to manage tracked items.

---

## Tech Stack

* **Core Language: JavaScript ES6+, HTML5, CSS3** 
* **Frontend:** React/Redux, Tailwind CSS, Vite
* **Backend:** Node.js, Express, Nodemailer
* **Scraping:** Cheerio.js
* **Database:** MongoDB Atlas, Mongoose
* **DevOps:** Render (Dockerized Containers), GitHub Actions (CI/CD)

---

## Technical Challenges & Solutions
Building a scraper is easy. Building a reliable scraper on a with 512MB RAM is a quite a different story. Here are the biggest hurdles I overcame:

### 1. The "Memory Crisis" (OOM Crashes)
**The Problem:** Running Headless Chrome consumes ~400MB+ RAM. Render's free tier limit is 512MB. Opening just two tabs in parallel caused the server to crash immediately with `Error: Instance failed: Ran out of memory`.
**The Solution:**
* **Strict Serial Processing:** Abandoned parallel `Promise.all` batching in favor of a stable, sequential loop.
* **Resource Blocking:** Implemented Request Interception to block images, fonts, and stylesheets, reducing scraping memory footprint by ~50%.
* **Container Optimization:** Tuned Puppeteer launch arguments to function reliably within the Docker runtime.

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
**The Problem:** Free tier servers "spin down" after inactivity.
**The Outcome:** Implemented a scheduler using GitHub Action
