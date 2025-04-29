# Online Bookstore Web App

This project is a full-stack online bookstore web application built using Node.js, Express, and MongoDB.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas) (or local MongoDB instance)

## Getting Started

### 1. Install Dependencies
Install all node modules needed to system.

```bash
npm install
```

### 2. Set up MongoDB
- Create a MongoDB Atlas cluster OR run a local MongoDB instance.
- Create a database called CSCDatabase with the following collections:
    - users
    - books
    - orders

Make sure to replace the MongoDB connection string in server.js with your own if running a local instance:
```javascript 
var client = new MongoClient('your-mongodb-connection-string-here')
```

### 3. Run the Server
```bash
node server.js
```
The server will start on:
http://localhost:8080