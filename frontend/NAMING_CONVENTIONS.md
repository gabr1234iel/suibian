# Naming Conventions - SuiBian Frontend

## Component Files
- `NavBar.tsx` - Unified navigation component (handles both logged-in/logged-out states)
- `Hero.tsx` - Landing page hero section with animated elements
- `FeatureCards.tsx` - Feature showcase cards
- `Process.tsx` - How it works section with interactive steps
- `CallToAction.tsx` - CTA section with floating icons and animations
- `AgentCard.tsx` - Individual agent display component for marketplace
- `LoadingScreen.tsx` - Loading/splash screen

## Page Files
- `index.tsx` - Root redirect page
- `landing.tsx` - Main landing page with in-page navigation
- `login.tsx` - Authentication page
- `dashboard.tsx` - User dashboard
- `marketplace.tsx` - Agent marketplace with filtering
- `create.tsx` - Create agent page with form validation
- `settings.tsx` - User settings
- `agent/[id].tsx` - Dynamic agent detail page
- `_app.tsx` - Next.js app wrapper