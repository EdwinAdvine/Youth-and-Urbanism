# Urban Home School - Student Control Panel

A comprehensive, modern student dashboard for the Urban Home School platform, built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

### 🎯 Core Dashboard
- **Welcome Widget**: Personalized greeting with learning streak, today's goals, and motivational quotes
- **Stats Cards**: Real-time overview of active courses, assignments, certificates, and wallet balance
- **Progress Tracking**: Visual progress bars and completion metrics
- **Quick Actions**: One-click access to continue learning, submit assignments, and join community

### 📚 Course Management
- **Browse & Filter**: Search courses by title, instructor, or description
- **Status Tracking**: View enrolled, in-progress, and completed courses
- **Progress Visualization**: Interactive progress bars with color-coded status indicators
- **Smart Sorting**: Sort by title, progress, or rating

### 📝 Assignment Management
- **Assignment Overview**: Complete view of all assignments with status indicators
- **Due Date Tracking**: Clear visual indicators for upcoming and overdue assignments
- **Grade Management**: View submitted assignments and received grades
- **Feedback System**: Access instructor feedback and comments
- **Submission Interface**: Easy assignment submission with file upload support

### 🎨 Modern UI/UX
- **Dark Theme**: Professional dark theme with red accents
- **Responsive Design**: Fully responsive layout for all devices
- **Interactive Elements**: Hover effects, transitions, and smooth animations
- **Accessibility**: Keyboard navigation and screen reader support

### 🔐 Authentication & Security
- **Role-Based Access**: Different dashboards for students, parents, instructors, admins, and partners
- **Protected Routes**: Secure routing with authentication checks
- **State Management**: Zustand for efficient state management
- **Type Safety**: Full TypeScript implementation

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Lucide React** - Modern icon library
- **React Hot Toast** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint Staged** - Pre-commit hooks

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   ├── layout/          # Layout components (Sidebar, Topbar, DashboardLayout)
│   │   ├── dashboard/       # Dashboard widgets and components
│   │   └── bird-chat/       # AI chat interface
│   ├── pages/               # Page components
│   │   ├── DashboardStudentNew.tsx  # Main student dashboard
│   │   ├── CoursesPage.tsx          # Course management page
│   │   └── AssignmentsPage.tsx      # Assignment management page
│   ├── store/               # Zustand state management
│   ├── services/            # API services and mock data
│   ├── types/               # TypeScript type definitions
│   ├── contexts/            # React contexts
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets
└── styles/                  # Global styles

backend/
├── main.py                  # FastAPI backend
├── requirements.txt         # Python dependencies
└── README.md               # Backend documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Urban-Home-School
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Backend Setup (Optional)
If you want to run the backend server:

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**
   ```bash
   python main.py
   ```

4. **Backend will be available at**
   `http://localhost:8000`

## 🎯 Key Features

### Student Dashboard
- **Personalized Welcome**: Dynamic greeting based on time of day
- **Learning Analytics**: Progress tracking and goal setting
- **Course Management**: Browse, filter, and track course progress
- **Assignment Center**: Complete assignment management with due date tracking
- **Achievement Showcase**: Display earned certificates and milestones

### Course Management
- **Smart Filtering**: Filter by status, category, or search terms
- **Progress Visualization**: Visual progress indicators for each course
- **Instructor Information**: View instructor details and ratings
- **Course Details**: Comprehensive course information and descriptions

### Assignment Management
- **Status Tracking**: Clear visual indicators for pending, submitted, and graded assignments
- **Due Date Management**: Prominent due date display with overdue warnings
- **Grade Display**: View grades and feedback from instructors
- **Submission Interface**: Easy file upload and submission process

### Responsive Design
- **Mobile-First**: Optimized for mobile devices with responsive breakpoints
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Cross-Browser**: Compatible with all modern browsers
- **Performance**: Optimized for fast loading and smooth interactions

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Urban Home School
VITE_THEME=default
```

### Theme Customization
The application supports theme customization through CSS variables:

```css
:root {
  --primary-color: #FF0000;
  --secondary-color: #E40000;
  --background-color: #0F1112;
  --card-background: #181C1F;
}
```

## 📊 State Management

The application uses Zustand for state management with the following stores:

### Auth Store
- User authentication state
- Login/logout functionality
- Role-based access control

### User Store
- User profile information
- Course progress tracking
- Assignment management
- Notification system
- Preferences and settings

### Theme Store
- Theme switching (light/dark)
- UI preferences
- Layout settings

## 🎨 Design System

### Color Palette
- **Primary**: Red (#FF0000, #E40000)
- **Background**: Dark gradients (#0F1112 to #181C1F)
- **Cards**: Dark surfaces (#181C1F, #22272B)
- **Borders**: Subtle borders (#2A3035)
- **Text**: White and gray variants

### Typography
- **Headings**: Bold, modern sans-serif
- **Body Text**: Clean, readable fonts
- **Code**: Monospace for technical content

### Spacing & Layout
- **Grid System**: 12-column responsive grid
- **Spacing**: Consistent spacing scale
- **Breakpoints**: Mobile, tablet, desktop responsive design

## 🔌 API Integration

The frontend is designed to work with a FastAPI backend:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Course Endpoints
- `GET /courses` - Get all courses
- `GET /courses/{id}` - Get course details
- `PUT /courses/{id}/progress` - Update course progress

### Assignment Endpoints
- `GET /assignments` - Get user assignments
- `POST /assignments/{id}/submit` - Submit assignment
- `GET /assignments/{id}/feedback` - Get assignment feedback

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
npm run format
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Community** - For the amazing ecosystem
- **Tailwind CSS** - For beautiful, utility-first styling
- **Zustand** - For simple, powerful state management
- **Vite** - For blazing fast development

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email us at support@urbanhomeschool.com

---

**Built with ❤️ by the Urban Home School Team**