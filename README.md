# Service Health Monitor

Distributed Service Health Monitor built using a Master–Slave architecture. The system continuously monitors the health of distributed nodes by collecting system metrics such as CPU usage, memory usage, and open ports.

This project demonstrates system design thinking, networking concepts, real-time communication, and full-stack development skills.

---

# Live URLs

Frontend Application  
https://service-monitor-rho.vercel.app  

Backend API  
https://service-monitor-mni6.onrender.com  

Test API Endpoint  
https://service-monitor-mni6.onrender.com/api/nodes  

---

# Project Overview

The system simulates a real-world infrastructure monitoring solution where a central server (master) continuously monitors multiple distributed agents (slaves).

Each slave agent runs on a machine and periodically sends heartbeat data to the master server.

The master server stores node health data and exposes APIs for monitoring.

The frontend dashboard displays real-time system health.

---


---

# Tech Stack

Frontend  
React.js  
Vite  
Tailwind CSS  
Axios  
Socket.IO Client  

Backend  
Node.js  
Express.js  
MongoDB Atlas  
Mongoose  
Socket.IO  
JWT Authentication  

Slave Agent  
Node.js  
OS module  
Axios  
TCP port scanning using net module  

Deployment  
Frontend hosted on Vercel  
Backend hosted on Render  
Database hosted on MongoDB Atlas  

---

# Features

Master Server  
Register slave nodes  
Receive heartbeat data  
Track node health  
Store system metrics  
Detect node failure  
Provide REST APIs  
Real-time updates using WebSockets  

Slave Agent  
Registers with master on startup  
Sends heartbeat every 20 seconds  
Collects CPU usage  
Collects memory usage  
Detects open ports  
Retry mechanism if master unavailable  
JWT authentication with master  

Frontend Dashboard  
Display all nodes  
Show node status (UP or DOWN)  
Display CPU usage  
Display memory usage  
Display open ports  
Display last heartbeat time  
View detailed node information  
Real-time updates using WebSockets  

Bonus Features Implemented  
Real-time updates using Socket.IO  
Retry mechanism when master unavailable  
JWT authentication between master and slaves  
Alert when node goes down  

---

# Folder Structure
service-monitor

client
src
api
components
pages
hooks

master
config
controllers
middleware
models
routes
services
utils
server.js

slave
services
utils
slave.js
