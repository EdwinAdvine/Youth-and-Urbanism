# Urban Home School - Port Management Setup

This document explains how to ensure dedicated ports for your React app and FastAPI backend with proper Python virtual environment management.

## 🎯 Overview

This setup ensures that:
- **Frontend (React/Vite)** always runs on port **3000**
- **Backend (FastAPI)** always runs on port **8000**
- Python dependencies are isolated in a virtual environment
- Port conflicts are automatically detected and resolved
- Professional development workflow is established

## 🚀 Quick Start

### 1. Setup Python Virtual Environment
```bash
# Run once to setup Python environment
./scripts/setup-python-env.sh
```

### 2. Start Development Environment
```bash
# Start both frontend and backend with port management
./scripts/dev-start.sh
```

### 3. Stop Services
```bash
# Stop all running services
./scripts/dev-stop.sh
```

## 📋 Available Scripts

### Frontend Scripts (run from `frontend/` directory)
```bash
npm run dev              # Start frontend only (port 3000)
npm run dev:check-ports  # Check port availability
npm run dev:start        # Start complete development environment
npm run dev:stop         # Stop all services
npm run build            # Build for production
npm run preview          # Preview production build
```

### Standalone Scripts (run from project root)
```bash
./scripts/check-ports.sh     # Check and resolve port conflicts
./scripts/setup-python-env.sh # Setup Python virtual environment
./scripts/dev-start.sh       # Start complete development environment
./scripts/dev-stop.sh        # Stop all services
```

## 🔧 Port Configuration

### Frontend (React/Vite)
- **Port**: 3000
- **Configuration**: `frontend/.env` and `frontend/vite.config.ts`
- **Environment Variable**: `VITE_PORT=3000`

### Backend (FastAPI)
- **Port**: 8000
- **Configuration**: `backend/.env` and `backend/main.py`
- **Environment Variable**: `PORT=8000`

### CORS Configuration
The backend is configured to allow requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

## 🐍 Python Virtual Environment

### Why Use Virtual Environment?
- Isolates project dependencies from system Python
- Prevents conflicts with other Python projects
- Ensures reproducible development environment
- No interference with your laptop's Python setup

### Virtual Environment Location
- **Path**: `backend/venv/`
- **Activation**: `cd backend && source venv/bin/activate`
- **Deactivation**: `deactivate`

### Managing Dependencies
```bash
# Activate virtual environment
cd backend && source venv/bin/activate

# Install new dependencies
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt
```

## 🛠️ Manual Service Management

### Starting Backend Only
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python main.py           # Start FastAPI server
```

### Starting Frontend Only
```bash
cd frontend
npm install              # Install dependencies (first time only)
npm run dev             # Start development server
```

## 🔍 Port Conflict Resolution

The system automatically handles port conflicts:

1. **Detection**: Scripts check if ports 3000 and 8000 are in use
2. **Resolution**: Offers to kill conflicting processes
3. **Prevention**: Ensures clean startup environment

### Manual Port Checking
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 8000
lsof -i :8000

# Kill process using port 3000 (replace PID)
kill -9 PID

# Kill process using port 8000 (replace PID)
kill -9 PID
```

## 📁 Project Structure

```
Urban Home School/
├── frontend/              # React application
│   ├── .env              # Frontend environment variables
│   ├── vite.config.ts    # Vite configuration with port 3000
│   └── src/              # React source code
├── backend/               # FastAPI application
│   ├── .env              # Backend environment variables
│   ├── main.py           # FastAPI server (port 8000)
│   ├── venv/             # Python virtual environment
│   └── requirements.txt  # Python dependencies
├── scripts/               # Development scripts
│   ├── check-ports.sh    # Port conflict resolution
│   ├── setup-python-env.sh # Virtual environment setup
│   ├── dev-start.sh      # Complete development startup
│   └── dev-stop.sh       # Service shutdown
└── README.md             # This file
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # or :8000

# Kill the process
kill -9 PID

# Or use the automated script
./scripts/check-ports.sh
```

### Python Virtual Environment Issues
```bash
# Recreate virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Dependencies Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
- Ensure `.env` files exist in both `frontend/` and `backend/` directories
- Check that environment variables are properly formatted
- Restart your terminal after making changes

## 🔒 Security Notes

- The virtual environment isolates Python dependencies
- Environment variables are stored in `.env` files (excluded from git)
- CORS is configured to only allow specific origins
- Never commit `.env` files or `venv/` directory to version control

## 🔄 Development Workflow

1. **Setup** (First time only):
   ```bash
   ./scripts/setup-python-env.sh
   ```

2. **Daily Development**:
   ```bash
   ./scripts/dev-start.sh  # Start everything
   # Work on your code...
   ./scripts/dev-stop.sh   # Stop when done
   ```

3. **Quick Port Check**:
   ```bash
   ./scripts/check-ports.sh
   ```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all scripts are executable: `chmod +x scripts/*.sh`
3. Ensure Node.js, npm, and Python3 are installed
4. Check that ports 3000 and 8000 are available

## 🎉 Benefits

✅ **No Port Conflicts**: Dedicated ports prevent conflicts  
✅ **Clean Environment**: Virtual environment isolates Python dependencies  
✅ **Automated Workflow**: One-command startup and shutdown  
✅ **Professional Setup**: Production-ready development environment  
✅ **Team Ready**: Consistent setup across development teams