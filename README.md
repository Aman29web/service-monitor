# Service Health Monitor

Distributed Service Health Monitor built using a Master Slave architecture. The system continuously monitors the health of distributed nodes by collecting system metrics such as CPU usage, memory usage, and open ports.

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

## Frontend
- React.js  
- Vite  
- Tailwind CSS  
- Axios  
- Socket.IO Client  

## Backend
- Node.js  
- Express.js  
- MongoDB Atlas  
- Mongoose  
- Socket.IO  
- JWT Authentication  

## Slave Agent
- Node.js  
- OS module  
- Axios  
- TCP port scanning using net module  

## Deployment
- Frontend hosted on Vercel  
- Backend hosted on Render  
- Database hosted on MongoDB Atlas  

---

# Features

## Master Server
- Register slave nodes  
- Receive heartbeat data  
- Track node health  
- Store system metrics  
- Detect node failure  
- Provide REST APIs  
- Real-time updates using WebSockets  

## Slave Agent
- Registers with master on startup  
- Sends heartbeat every 20 seconds  
- Collects CPU usage  
- Collects memory usage  
- Detects open ports  
- Retry mechanism if master unavailable  
- JWT authentication with master  

## Frontend Dashboard
- Display all nodes  
- Show node status (UP or DOWN)  
- Display CPU usage  
- Display memory usage  
- Display open ports  
- Display last heartbeat time  
- View detailed node information  
- Real-time updates using WebSockets  

## Bonus Features Implemented
- Real-time updates using Socket.IO  
- Retry mechanism when master unavailable  
- JWT authentication between master and slaves  
- Alert when node goes down  

---
# Folder Structure

```
service-monitor
│
├── client
│   └── src
│       ├── api
│       ├── components
│       ├── pages
│       └── hooks
│
├── master
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   └── server.js
│
└── slave
    ├── services
    ├── utils
    └── slave.js
```

---

# API Endpoints

Register node  

POST /api/nodes/register  

Registers slave node and returns JWT token.

---

Send heartbeat  

POST /api/nodes/heartbeat  

Updates node health metrics.

Example request body:
Example request body:


{
"nodeId": "LAPTOP-F58TASBU-5001",
"cpuUsage": 35,
"memoryUsage": 60,
"openPorts": [3000, 80]
}


---

Get all nodes  

GET /api/nodes  

Returns all nodes with current status.

---

Get node details  

GET /api/nodes/:id  

Returns detailed node metrics.

---

Health check endpoint  

GET /health  

Returns server uptime status.

---

# Environment Variables

## Backend .env
```
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173,https://service-monitor-rho.vercel.app
```

## Frontend .env
```
VITE_MASTER_URL=https://service-monitor-mni6.onrender.com
```

## Run backend
```
cd master
npm install
npm run dev
```

## Run frontend
```
cd slave
npm install
node slave.js
```


---

# Simulating Multiple Nodes

Multiple slave nodes can be simulated on the same machine using different ports.

Open multiple terminals and run:
node slave.js
node slave.js --port 5001
node slave.js --port 5002

Each process acts as an independent node and sends heartbeat data to the master server.

Example node IDs:

LAPTOP-F58TASBU-default  
LAPTOP-F58TASBU-5001  
LAPTOP-F58TASBU-5002  

---

# How Node Health Works

Slave sends heartbeat every 20 seconds.

Master server records last heartbeat timestamp.

If no heartbeat is received within a defined interval, node status is marked as DOWN.

Example:

Node sending heartbeat regularly → status UP  

Slave stopped → heartbeat stops → status DOWN  

---

# Design Decisions

Master–Slave architecture used to simulate distributed monitoring systems.

Heartbeat mechanism used for failure detection.

Socket.IO used for real-time updates.

JWT authentication used for secure communication.

Retry mechanism implemented to handle temporary network failures.

MongoDB used for flexible schema design.

Modular folder structure used for scalability and maintainability.

---

# Demo Instructions

Start backend server.

Start frontend application.

Run at least 2–3 slave agents.

Observe nodes appearing in dashboard.

Stop one slave process.

Observe node status changing from UP to DOWN.

---

# Assumptions

Slave nodes are simulated locally for demonstration purposes.

In real production environments, slave agents would run on distributed machines across infrastructure.

Open ports are detected using a simple TCP scan instead of full Nmap.

---

# Author

Aman Singh
