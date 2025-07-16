# Chat Application

Welcome to the Chat Application, a robust real-time messaging platform built with Node.js, Express, and Socket.IO. This application supports public and private chat rooms, friend management, image uploads, and secure authentication using JWT and Passport. Designed for seamless communication, it integrates with MongoDB for data persistence and RabbitMQ for message queuing.

## Features
- **Real-Time Messaging**: Instant messaging in public and private chat rooms using Socket.IO.
- **Private Chats**: One-on-one conversations with friend-specific rooms.
- **Friend Management**: Search for users, send friend requests, and accept or reject pending requests.
- **Image Uploads**: Share images via Cloudinary integration.
- **Authentication**: Secure login with JWT tokens and Passport.js for user verification.
- **Reactive UI**: Dynamic updates for message edits, deletions, and reactions.
- **Cross-Platform**: Accessible via web browsers with CORS support.

## Technologies Used
- **Backend**: Node.js, Express
- **Real-Time**: Socket.IO
- **Database**: MongoDB with Mongoose
- **Message Queuing**: RabbitMQ
- **Authentication**: Passport.js, JWT
- **File Storage**: Cloudinary
- **Frontend**: React (assumed based on context)
- **Other**: Axios, Multer, CORS, dotenv

## Prerequisites
- Node.js (v14.x or later)
- MongoDB (local or remote instance)
- RabbitMQ (local or remote instance)
- Cloudinary account for image uploads
- Git

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-username/chat-application.git
cd chat-application
```

### Set Up Environment Variables
Create a .env file in the root directory and add the following:
```bash
MONGO_URL=your_mongodb_connection_string
PORT=5000
RABBIT_URL=amqp://localhost
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_secure_jwt_secret
```

### Install Dependencies
```bash
npm install
```

### Start the Application
1. Ensure MongoDB and RabbitMQ are running.
2. Start the server:
```bash
npm start
```
3. The application will be available at http://localhost:5000.

### Usage
- Login: Use the /api/auth/login endpoint with a POST request containing username and password to obtain a JWT token.
- Chat: Connect via Socket.IO to join public rooms (/join-room) or private rooms (/join-private-room) with a username.
- Friend Management: Access the Friends tab to search users and manage requests via /api/users endpoints.
- Image Upload: Use the /api/upload endpoint to share images in chats.

### API Endpoints
  - /api/auth/login: Authenticate and retrieve a JWT token.
  - /api/users/search: Search for users by username.
  - /api/users/friends: Retrieve friends, pending requests, and sent requests.
  - /api/users/friends/request: Send a friend request.
  - /api/users/friends/accept: Accept a friend request.
  - /api/users/friends/reject: Reject a friend request.
  - /api/upload: Upload an image.
  - /api/messages/:room: Fetch public room messages.
  - /api/messages/private/:room: Fetch private room messages (authenticated).
 
### Project Structure
chat-application/
├── server/
│   ├── config/           # Configuration files (e.g., passport.js)
│   ├── middleware/       # Middleware (e.g., auth.js)
│   ├── models/           # Mongoose models (e.g., Message.js, User.js)
│   ├── routes/           # Route handlers (e.g., auth.js, users.js)
│   ├── index.js          # Main server file
│   └── package.json
├── client/               # Frontend code (assumed React project)
├── .env                  # Environment variables
└── README.md

### Contributing
We welcome contributions to enhance this chat application! Please follow these steps:
1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Commit your changes (git commit -m "Add new feature").
4. Push to the branch (git push origin feature-branch).
5. Open a Pull Request with a detailed description of your changes.

### Issues
If you encounter any bugs or have feature requests, please open an issue on the GitHub Issues page.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

### Acknowledgments
- Thanks to the open-source communities behind Node.js, Express, Socket.IO, and other dependencies.
- Inspired by modern real-time communication applications.
