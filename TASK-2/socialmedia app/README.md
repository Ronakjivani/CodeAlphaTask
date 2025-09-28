# Social Media Platform

A full-stack social media platform built with Express.js, MongoDB, and vanilla JavaScript. Features include user authentication, posts, comments, likes, follows, and real-time interactions.

## Features

### Core Features
- **User Authentication**: Register, login, and secure JWT-based authentication
- **User Profiles**: Customizable profiles with bio, profile pictures, and privacy settings
- **Posts**: Create, edit, delete posts with visibility controls (public, followers, private)
- **Comments**: Add, edit, delete comments on posts with threaded replies
- **Likes**: Like/unlike posts and comments
- **Follow System**: Follow/unfollow users with follower suggestions
- **Search**: Search for users by name or username
- **Feed**: Personalized feed showing posts from followed users

### Additional Features
- **Privacy Controls**: Private accounts and post visibility settings
- **Real-time Updates**: Dynamic UI updates without page refresh
- **Responsive Design**: Mobile-friendly interface
- **Toast Notifications**: User feedback for all actions
- **Image Support**: Post images (structure ready for implementation)
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet.js for security headers, bcrypt for password hashing

## Technology Stack

### Backend
- **Node.js & Express.js**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Rate Limiting**: API protection
- **Multer**: File upload handling (ready for images)

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox/Grid
- **Vanilla JavaScript**: ES6+ features, async/await
- **Font Awesome**: Icons
- **Responsive Design**: Mobile-first approach

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/socialmedia
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

4. **Database Setup**
   - Make sure MongoDB is running on your system
   - The application will automatically create the database and collections

5. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:3000`

## Project Structure

```
social-media-platform/
├── models/                 # Database models
│   ├── User.js            # User model with authentication
│   ├── Post.js            # Post model with likes/comments
│   └── Comment.js         # Comment model with replies
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User profile routes
│   ├── posts.js          # Post CRUD routes
│   ├── comments.js       # Comment routes
│   ├── likes.js          # Like/unlike routes
│   └── follows.js        # Follow system routes
├── middleware/           # Custom middleware
│   └── auth.js          # JWT authentication middleware
├── public/              # Frontend files
│   ├── index.html       # Main HTML file
│   ├── styles.css       # CSS styles
│   └── app.js          # Frontend JavaScript
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
└── README.md         # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `GET /api/users/:userId/followers` - Get user followers
- `GET /api/users/:userId/following` - Get user following

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts/feed` - Get user feed
- `GET /api/posts/user/:username` - Get user posts
- `GET /api/posts/:postId` - Get single post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post

### Comments
- `POST /api/comments` - Add comment
- `GET /api/comments/post/:postId` - Get post comments
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

### Likes
- `POST /api/likes/post/:postId` - Like/unlike post
- `POST /api/likes/comment/:commentId` - Like/unlike comment
- `GET /api/likes/post/:postId` - Get post likes
- `GET /api/likes/comment/:commentId` - Get comment likes

### Follows
- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user
- `GET /api/follows/status/:userId` - Get follow status
- `GET /api/follows/suggestions` - Get follow suggestions

## Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  bio: String,
  profilePicture: String,
  followers: [ObjectId],
  following: [ObjectId],
  posts: [ObjectId],
  isPrivate: Boolean,
  createdAt: Date,
  lastActive: Date
}
```

### Post Model
```javascript
{
  author: ObjectId (User),
  content: String,
  image: String,
  likes: [{ user: ObjectId, createdAt: Date }],
  comments: [ObjectId],
  createdAt: Date,
  updatedAt: Date,
  isEdited: Boolean,
  tags: [String],
  visibility: String (public/followers/private)
}
```

### Comment Model
```javascript
{
  author: ObjectId (User),
  post: ObjectId (Post),
  content: String,
  likes: [{ user: ObjectId, createdAt: Date }],
  replies: [ObjectId],
  parentComment: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  isEdited: Boolean
}
```

## Usage Guide

### Getting Started
1. **Register**: Create a new account with username, email, and password
2. **Login**: Use your credentials to access the platform
3. **Complete Profile**: Add bio and profile picture
4. **Find Users**: Use the search feature to find and follow other users
5. **Create Posts**: Share your thoughts with different visibility settings
6. **Interact**: Like and comment on posts from users you follow

### Key Features Usage

#### Creating Posts
- Click in the "What's on your mind?" text area
- Write your content (up to 2000 characters)
- Choose visibility: Public, Followers, or Private
- Click "Post" to share

#### Following Users
- Search for users using the search bar
- Visit user profiles by clicking on their names
- Click "Follow" to see their posts in your feed
- Check "Suggested for you" section for recommendations

#### Privacy Settings
- Toggle private account in profile settings
- Private accounts require approval for followers
- Control post visibility per post

#### Comments and Likes
- Click the heart icon to like posts/comments
- Click the comment icon to view and add comments
- Comments support threaded replies

## Development

### Adding New Features
1. **Backend**: Add routes in `/routes/` and models in `/models/`
2. **Frontend**: Update `/public/app.js` for API calls and `/public/styles.css` for styling
3. **Database**: Modify existing models or create new ones as needed

### Testing
- Use Postman or similar tools to test API endpoints
- MongoDB Compass for database inspection
- Browser developer tools for frontend debugging

### Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel/Netlify**: Frontend with separate backend deployment
- **VPS**: Full control with PM2 process management
- **Docker**: Containerized deployment

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- Private account functionality

## Future Enhancements

- Real-time messaging system
- Push notifications
- Image/video upload with cloud storage
- Advanced search filters
- Hashtag system
- Story feature
- Content moderation
- Mobile app development
- Email verification
- Password reset functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API endpoints and models

## Acknowledgments

- Express.js community for excellent documentation
- MongoDB for flexible database solution
- Font Awesome for beautiful icons
- All contributors and testers

---

Built with ❤️ using modern web technologies
