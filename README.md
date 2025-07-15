# AStudy - AI-Powered Learning Platform

A modern, responsive learning platform built with Next.js, Ant Design Pro, and Tailwind CSS 4, featuring AI-powered question generation and comprehensive learning analytics.

## 🚀 Features

- **AI-Powered Learning**: Generate personalized questions using OpenAI API
- **Topic Management**: Organize and track learning topics with progress monitoring
- **Learning Analytics**: Detailed insights into learning patterns and performance
- **Activity Tracking**: GitHub-style activity graph showing daily learning progress
- **Telegram Integration**: Receive notifications and questions via Telegram bot
- **Responsive Design**: Modern UI that works on all devices
- **Theme Support**: Light/Dark mode with happy-work-theme integration
- **Authentication**: Secure authentication with Clerk

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── dashboard/         # Dashboard (protected)
│   │   └── page.tsx      # Main dashboard
│   └── topics/           # Topics management
│       └── page.tsx      # Topics page
├── components/            # Reusable components
│   ├── ActivityGraph.tsx  # GitHub-style activity graph
│   ├── StatsCard.tsx      # Statistics display card
│   ├── TopicCard.tsx      # Topic information card
│   ├── AddTopicModal.tsx  # Add topic modal
│   ├── SearchFilterBar.tsx # Search and filter component
│   └── SettingsForm.tsx   # Settings form component
├── data/                  # Data management
│   └── mockData.ts        # Mock data and utility functions
├── utils/                 # Utility functions
│   └── helpers.ts         # Common helper functions
└── styles/                # Global styles
    └── globals.css        # Tailwind CSS and custom styles
```

## 🧩 Component Architecture

### Core Components

#### `ActivityGraph`

- **Purpose**: GitHub-style activity heatmap showing learning progress
- **Features**:
  - 365-day activity visualization
  - Color-coded intensity levels
  - Interactive tooltips
  - Responsive design

#### `StatsCard`

- **Purpose**: Reusable statistics display component
- **Features**:
  - Configurable icons and colors
  - Support for prefixes and suffixes
  - Consistent styling across the app

#### `TopicCard`

- **Purpose**: Display topic information in a consistent format
- **Features**:
  - Progress indicators
  - Action buttons (view, edit, delete)
  - Color-coded difficulty and status tags

#### `SearchFilterBar`

- **Purpose**: Unified search and filtering interface
- **Features**:
  - Search functionality
  - Category and difficulty filters
  - Date range selection
  - Export/Import actions

#### `AddTopicModal`

- **Purpose**: Modal for adding new learning topics
- **Features**:
  - Form validation
  - Category and difficulty selection
  - Loading states

#### `SettingsForm`

- **Purpose**: Comprehensive settings configuration
- **Features**:
  - Profile settings
  - Notification preferences
  - Learning preferences
  - AI configuration
  - Telegram integration
  - Appearance settings

## 📊 Data Management

### Centralized Data (`src/data/mockData.ts`)

- **Mock Topics**: Sample learning topics with full metadata
- **Mock History**: Learning session history
- **Mock Activity**: Daily activity data for the graph
- **Utility Functions**:
  - `calculateStats()`: Topic statistics
  - `calculateHistoryStats()`: History statistics
  - `calculateAnalyticsData()`: Analytics calculations

### Helper Functions (`src/utils/helpers.ts`)

- **Color Utilities**: Score, difficulty, and status color mapping
- **Date Formatting**: Various date format functions
- **Data Filtering**: Topic and history filtering logic
- **Validation**: Email and API key validation
- **Time Utilities**: Time formatting and progress calculation
- **Storage**: Local storage utilities
- **Debounce**: Search debouncing utility

## 🎨 Styling

### Tailwind CSS 4

- Modern utility-first CSS framework
- Responsive design system
- Custom animations and transitions

### Ant Design Pro

- Professional UI components
- Consistent design language
- Advanced form components

### Happy Work Theme

- Modern, cheerful design theme
- Optimized for productivity
- Consistent color palette

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach**
- **Breakpoint system**: xs, sm, md, lg, xl
- **Flexible layouts**: Grid and Flexbox
- **Touch-friendly interactions**

## 🚀 Performance Optimizations

- **Component Memoization**: React.memo and useMemo for expensive calculations
- **Lazy Loading**: Dynamic imports for large components
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Tree shaking and dead code elimination

## 🔒 Security Features

- **Authentication**: Clerk integration for secure user management
- **API Key Validation**: Secure API key handling
- **Input Sanitization**: Form validation and sanitization
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Next.js CSRF protection

## 📈 Analytics & Monitoring

- **Learning Progress**: Track study time and scores
- **Performance Metrics**: Average scores and completion rates
- **Activity Patterns**: Daily and weekly activity tracking
- **Topic Analytics**: Category and difficulty performance

## 🔄 State Management

- **Local State**: React useState for component state
- **Form State**: Ant Design Form for complex forms
- **URL State**: Next.js router for navigation state
- **Local Storage**: User preferences and settings

## 🧪 Testing Strategy

- **Component Testing**: Unit tests for reusable components
- **Integration Testing**: Page-level testing
- **E2E Testing**: User workflow testing
- **Performance Testing**: Bundle size and loading times

## 📚 Documentation

- **Component Documentation**: JSDoc comments for all components
- **API Documentation**: Function signatures and parameters
- **Usage Examples**: Code examples for each component
- **Best Practices**: Development guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Next.js, Ant Design Pro, and Tailwind CSS**
