# AI Co-Pilot Sidebar

A retractable AI co-pilot sidebar component inspired by Microsoft Copilot, designed for the Urban Home School platform. This component provides quick AI assistance across different user roles (student, parent, teacher, admin, partner) with offline support and accessibility features.

## Features

### Core Functionality
- **Retractable Design**: Toggle between 48px retracted and 360px expanded states
- **Role-Specific Content**: Different AI responses and quick actions for each user role
- **Session Management**: Create, switch, and delete AI conversation sessions
- **Offline Support**: Graceful degradation when internet connection is unavailable
- **Real-time Status**: Online/offline indicators and connection status

### Microsoft Copilot Inspiration
- **Fluent UI Design**: Clean, professional aesthetic with rounded corners and subtle shadows
- **Smooth Animations**: 300ms transitions with Framer Motion for smooth interactions
- **Acrylic Effects**: Semi-transparent backgrounds with backdrop blur
- **Color Theming**: Role-specific color schemes (Blue/Cyan for students, Green/Emrald for parents, etc.)

### Accessibility & Performance
- **WCAG 2.1 Compliant**: Full keyboard navigation, screen reader support, ARIA labels
- **Reduced Motion Support**: Respects user's `prefers-reduced-motion` setting
- **Low-End Device Optimization**: Performance optimizations for devices with limited resources
- **High Contrast Mode**: Automatic adjustments for high contrast displays

### Responsive Design
- **Desktop**: Fixed left sidebar with full functionality
- **Mobile**: Bottom drawer that slides up with touch-friendly interface
- **Tablet**: Adaptive layout based on screen size

## Components

### Core Components
- `CoPilotSidebar.tsx` - Main sidebar component with toggle functionality
- `CoPilotMobileDrawer.tsx` - Mobile-specific bottom drawer implementation
- `CoPilotContent.tsx` - Chat interface and quick actions
- `CoPilotAccessibility.tsx` - Accessibility enhancements and screen reader support
- `CoPilotPerformance.tsx` - Performance optimizations for low-end devices

### State Management
- `coPilotStore.ts` - Zustand store for co-pilot state management
- Integration with existing `chatStore.ts` for message handling

## Usage

### Basic Integration
```tsx
import CoPilotSidebar from './components/co-pilot/CoPilotSidebar';

function DashboardLayout() {
  return (
    <div className="flex">
      <CoPilotSidebar />
      <main>...your content...</main>
    </div>
  );
}
```

### Role-Specific Configuration
```tsx
// The sidebar automatically adapts based on the active role
// Available roles: 'student', 'parent', 'teacher', 'admin', 'partner'

// Role switching
const { setActiveRole } = useCoPilotStore();
setActiveRole('teacher'); // Changes the sidebar content and styling
```

### State Management
```tsx
import { useCoPilotStore } from './store/coPilotStore';

const coPilotState = useCoPilotStore();

// Check if sidebar is expanded
const isExpanded = coPilotState.isExpanded;

// Toggle sidebar
coPilotState.toggleExpanded();

// Check online status
const isOnline = coPilotState.isOnline;
```

## Styling

### Tailwind Configuration
The implementation extends Tailwind CSS with Microsoft Copilot-inspired colors and utilities:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'copilot-blue': {
        50: '#e6f4ff',
        100: '#b3d9ff',
        // ... more shades
      },
      // ... other role colors
    },
    boxShadow: {
      'copilot-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      // ... more shadow variants
    }
  }
}
```

### CSS Variables
Performance optimizations use CSS variables for dynamic theming:

```css
:root {
  --animation-duration: 300ms;
  --shadow-strength: 8px;
}

.co-pilot-low-end {
  --animation-duration: 150ms;
  --shadow-strength: 0px;
}
```

## Performance Optimizations

### Device Detection
- **Memory-based**: Detects devices with less than 4GB RAM
- **Connection-based**: Identifies slow network connections (2G/3G)
- **CPU-based**: Optimizes for mobile devices and smaller screens

### Animation Optimizations
- **Reduced Motion**: Respects user preferences for motion sensitivity
- **Hardware Acceleration**: Uses `transform` and `opacity` for smooth animations
- **Frame Throttling**: Uses `requestAnimationFrame` for scroll optimization

### Memory Management
- **Lazy Loading**: Content loads only when needed
- **Cleanup**: Proper cleanup of event listeners and animation frames
- **Virtualization**: Long lists are virtualized for performance

## Accessibility Features

### Keyboard Navigation
- **Tab Navigation**: Full keyboard accessibility with focus trapping
- **Escape Key**: Close sidebar with Escape key
- **Enter/Space**: Activate buttons with keyboard

### Screen Reader Support
- **ARIA Labels**: All interactive elements have proper ARIA labels
- **Live Regions**: Screen reader announcements for state changes
- **Semantic HTML**: Proper heading hierarchy and semantic elements

### Visual Accessibility
- **High Contrast**: Automatic adjustments for high contrast mode
- **Focus Indicators**: Clear focus indicators for keyboard users
- **Text Alternatives**: All icons have text alternatives

## Offline Support

### Connection Monitoring
- **Online/Offline Events**: Automatic detection of connection status
- **Visual Indicators**: Clear status indicators for users
- **Graceful Degradation**: Limited functionality when offline

### Data Persistence
- **Local Storage**: Sessions and preferences persist across sessions
- **Service Worker**: Optional service worker for enhanced offline support
- **Cached Content**: Static content cached for offline access

## Testing

### Manual Testing Component
A test component is provided for development and manual testing:

```tsx
import TestCoPilot from './components/co-pilot/__tests__/TestCoPilot';

function DevelopmentPage() {
  return (
    <TestCoPilot initialState={{
      isExpanded: true,
      activeRole: 'teacher',
      isOnline: false
    }} />
  );
}
```

### Test Scenarios
- Toggle functionality
- Role switching
- Online/offline status changes
- Keyboard navigation
- Screen reader compatibility
- Performance on low-end devices

## Browser Support

### Modern Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Progressive Enhancement
- Basic functionality works on older browsers
- Advanced features gracefully degrade
- Touch support for mobile devices

## Integration with Existing Systems

### Chat System Integration
- Reuses existing `chatStore.ts` for message management
- Compatible with existing speech synthesis hooks
- Integrates with user preferences and theme system

### Dashboard Integration
- Works alongside existing sidebar navigation
- Compatible with topbar and layout components
- **Precise Positioning**: Co-pilot starts exactly below the topbar (top-16 on mobile, top-20 on desktop)
- **Dynamic Layout**: Main content area automatically adjusts to create space for co-pilot when expanded
- **Responsive Behavior**: 
  - Desktop: Content shifts left by 384px (96 * 4rem) when co-pilot expands
  - Mobile: No layout shift (co-pilot uses bottom drawer)
  - Tablet: Adaptive behavior based on screen size
- Respects existing z-index hierarchy
- Smooth transitions with 300ms duration

## Future Enhancements

### Potential Features
- **Voice Input**: Speech-to-text for hands-free interaction
- **CBC Integration**: Direct integration with Competency-Based Curriculum
- **Multi-language**: Support for Kiswahili and other local languages
- **Advanced AI**: Integration with Grok API for real AI responses
- **Analytics**: Usage analytics and performance monitoring

### Performance Improvements
- **Code Splitting**: Lazy load co-pilot components
- **Image Optimization**: Optimize icons and images for faster loading
- **Bundle Analysis**: Monitor bundle size impact

## Troubleshooting

### Common Issues
1. **Animations not working**: Check `prefers-reduced-motion` settings
2. **Layout conflicts**: Ensure proper z-index values
3. **Performance issues**: Enable low-end device mode
4. **Accessibility problems**: Verify ARIA labels and keyboard navigation

### Debug Mode
Enable debug mode by setting environment variable:
```bash
REACT_APP_DEBUG_COPILOT=true
```

This shows performance indicators and state information in development.

## Contributing

When contributing to this component:
1. Maintain Microsoft Copilot design principles
2. Ensure accessibility compliance
3. Test on low-end devices
4. Update documentation for new features
5. Follow existing code patterns and naming conventions

## License

This component is part of the Urban Home School platform and follows the project's licensing terms.