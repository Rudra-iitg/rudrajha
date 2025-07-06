# AWS Amplify Configuration for Static Frontend

## Build Settings

### Frontend build command:
```
# Leave empty - no build process needed for static HTML/CSS/JS
```

### Build output directory:
```
.
```

## Environment Variables (if needed)
- No environment variables needed for static frontend

## File Structure for Deployment:
```
frontend/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # Main JavaScript
├── config.js           # API configuration
├── ai-chat.js          # AI chat functionality
├── contact.js          # Contact form handler
├── notification.js     # Notification system
├── logo.png            # Logo image
├── hero_background.jpg # Background image
├── bigg.png            # Additional image
└── admin/              # Admin panel files
    ├── dashboard.html
    ├── login.html
    └── chat-history.html
```

## Important Notes:
1. Your frontend is a static application - no Node.js or npm required
2. All dependencies are loaded via CDN (Tailwind CSS, Font Awesome, Google Fonts)
3. Make sure config.js points to your backend URL: https://my-website-backend-1mcf.onrender.com
4. Enable HTTPS for secure API calls to your backend
