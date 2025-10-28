# WeConnect CRM Design System

This document outlines the design system implemented for WeConnect CRM based on the UI mockboard specifications.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Grid System](#grid-system)
3. [Typography](#typography)
4. [Components](#components)
5. [Usage Examples](#usage-examples)

## Color Palette

### Primary Colors

- **WeConnect Red**: `#EF444E` - Primary brand color, used for CTAs and primary actions
- **WeConnect Black**: `#2B2C2B` - Primary text and emphasis color (Updated from moodboard)
- **White**: `#FFFFFF` - Background and text on dark elements

### Secondary Colors

- **Blue**: `#446AEF` - Information and secondary actions
- **Orange**: `#F7B638` - Warnings and attention states (Updated from moodboard)
- **Green**: `#5ED790` - Success states and positive feedback
- **Purple**: `#AC5ADE` - Premium features and highlights
- **Cyan**: `#63DCE4` - Accents and special highlights

### Usage

```tsx
// In Tailwind CSS classes
className="bg-weconnect-red text-white"
className="text-brand-blue border-brand-green"

// In JavaScript (constants)
import { UI_CONFIG } from './constants';
const primaryColor = UI_CONFIG.COLORS.PRIMARY; // #EF444E
```

## Grid System

### 30px Base Unit

The design system uses a 30px base unit for all spacing and layout decisions.

- **Column Width**: 30px
- **Gutter**: 15px (half column)
- **Container**: Maximum 40 columns (1200px)

### Grid Components

```tsx
import { Grid, GridItem, Container, Column, Spacer } from '@/components/ui';

// 12-column grid
<Grid cols={12} gap={1}>
  <GridItem span={4}>Left content</GridItem>
  <GridItem span={8}>Main content</GridItem>
</Grid>

// Fixed-width columns
<Column width={4}>120px wide column</Column>

// Container with automatic centering
<Container size="lg">Content</Container>

// Spacing
<Spacer size={2} direction="vertical" /> // 60px vertical space
```

### Utility Classes

```css
.grid-col      /* 30px width */
.grid-col-2    /* 60px width */
.grid-col-3    /* 90px width */
.grid-col-4    /* 120px width */
.grid-col-6    /* 180px width */

.grid-gap      /* 15px gap */
.grid-gap-2    /* 30px gap */
.grid-gap-3    /* 45px gap */
```

## Typography

### Font Family

**Primary**: Proxima Nova (with fallbacks)
- Used throughout the application
- Loaded via @font-face in `index.css`

### Font Weights

- **Normal**: 400 (default)
- **Medium**: 500 (for labels and secondary text)
- **Semibold**: 600 (for buttons and emphasized text)
- **Bold**: 700 (for headings and important text)

## Components (Updated from Moodboard)

### Input Fields

Based on the moodboard, input fields support multiple states and configurations.

#### Standard Input (Without Icon)

```html
<!-- Default -->
<input type="text" class="input-base" placeholder="Default" />

<!-- Hover -->
<input type="text" class="input-base" placeholder="Hover" />

<!-- Active/Focus -->
<input type="text" class="input-base" placeholder="Active" />

<!-- Disabled -->
<input type="text" class="input-base" placeholder="Disabled" disabled />

<!-- Error -->
<input type="text" class="input-base error" placeholder="Error" />
```

#### Input with Divided Icon

```html
<div class="input-divided">
  <div class="input-icon-left">
    <svg><!-- icon svg --></svg>
  </div>
  <input type="email" placeholder="email@example.com" />
</div>

<!-- Error state -->
<div class="input-divided error">
  <div class="input-icon-left">
    <svg><!-- icon svg --></svg>
  </div>
  <input type="email" placeholder="Error" />
</div>

<!-- Disabled state -->
<div class="input-divided disabled">
  <div class="input-icon-left">
    <svg><!-- icon svg --></svg>
  </div>
  <input type="email" placeholder="Disabled" disabled />
</div>
```

#### React/TypeScript Example

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input placeholder="Enter text" />

// With icon (divided style)
<Input 
  leftIcon={<EmailIcon />} 
  divided={true}
  placeholder="email@example.com" 
/>

// With states
<Input error="This field is required" />
<Input disabled />
```

#### Input States

1. **Default**: Light gray border (#E5E7EB)
2. **Hover**: Blue border (#446AEF)
3. **Active/Focus**: Blue border with shadow ring
4. **Error**: Red border (#EF444E) with red shadow ring
5. **Disabled**: Gray background with reduced opacity

### Buttons

#### Primary CTA Button

```html
<!-- Default -->
<button class="btn-primary">DEFAULT</button>

<!-- Hover -->
<button class="btn-primary">HOVER</button>

<!-- Focused -->
<button class="btn-primary">FOCUSED</button>

<!-- Disabled -->
<button class="btn-primary" disabled>DISABLED</button>

<!-- With Icon -->
<button class="btn-primary">
  <span>DEFAULT</span>
  <span class="btn-icon">→</span>
</button>
```

#### Secondary CTA Button

```html
<!-- Default -->
<button class="btn-secondary">DEFAULT</button>

<!-- Hover -->
<button class="btn-secondary">HOVER</button>

<!-- Focused -->
<button class="btn-secondary">FOCUSED</button>

<!-- Disabled -->
<button class="btn-secondary" disabled>DISABLED</button>

<!-- With Icon -->
<button class="btn-secondary">
  <span>DEFAULT</span>
  <span class="btn-icon">→</span>
</button>
```

#### Tertiary Button (Text Only)

```html
<!-- Default -->
<button class="btn-tertiary">DEFAULT</button>

<!-- Hover -->
<button class="btn-tertiary">HOVER</button>

<!-- With Icon -->
<button class="btn-tertiary">
  <span>DEFAULT</span>
  <span class="btn-icon">→</span>
</button>
```

#### React/TypeScript Example

```tsx
import { Button } from '@/components/ui';

// Primary button (WeConnect red)
<Button variant="primary">Save Changes</Button>

// Secondary button (outlined)
<Button variant="secondary">Cancel</Button>

// Tertiary button (text only)
<Button variant="tertiary">Learn More</Button>

// With icons
<Button variant="primary" icon={<ArrowRightIcon />}>
  Continue
</Button>
```

### Cards

#### Basic Card

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-header-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn-secondary">Action</button>
  </div>
</div>
```

#### List Item Card (Device List Style)

```html
<div class="card-list-item">
  <div class="card-list-item-icon">
    <svg><!-- icon --></svg>
  </div>
  <div class="card-list-item-content">
    <div class="card-list-item-title">Air Conditioner</div>
    <div class="card-list-item-subtitle">2 unit - 196 kWh</div>
  </div>
  <div>
    <svg><!-- chevron icon --></svg>
  </div>
</div>
```

#### Scene Card

```html
<div class="card-scene" style="background: linear-gradient(135deg, #A8C5FF 0%, #6B9BFF 100%);">
  <div class="card-scene-icon" style="background: #446AEF;">
    <svg><!-- sun icon --></svg>
  </div>
  <div class="card-scene-title">Morning Scene</div>
  <div class="card-scene-subtitle">7 Devices</div>
</div>
```

#### Stats Card

```html
<div class="card-stats">
  <div class="card-stats-value">8,295.00</div>
  <div class="card-stats-label">Total Revenue (USD)</div>
</div>
```

### Modals & Popups

#### Modal (Large Dialog)

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-header-content">
        <div class="modal-header-icon">
          <svg><!-- icon --></svg>
        </div>
        <div class="modal-header-text">
          <h2 class="modal-title">Invite to Project</h2>
          <p class="modal-subtitle">Collaborate with members on this project.</p>
        </div>
      </div>
      <button class="modal-close">
        <svg><!-- close icon --></svg>
      </button>
    </div>
    
    <div class="modal-body">
      <!-- Modal content -->
    </div>
    
    <div class="modal-footer">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Send Invite</button>
    </div>
  </div>
</div>
```

#### Popup (Small Dialog)

```html
<div class="modal-overlay">
  <div class="popup">
    <div class="popup-header">
      <h3 class="popup-title">Confirm Action</h3>
    </div>
    <div class="popup-body">
      <p>Are you sure you want to proceed?</p>
    </div>
    <div class="popup-footer">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

#### Leaflet (Slide-in Panel)

```html
<!-- Right-side leaflet -->
<div class="leaflet">
  <div class="leaflet-header">
    <h2 class="leaflet-title">Request Appointment</h2>
    <button class="leaflet-close">
      <svg><!-- close icon --></svg>
    </button>
  </div>
  
  <div class="leaflet-body">
    <!-- Form fields, appointment details, etc. -->
  </div>
  
  <div class="leaflet-footer">
    <button class="btn-secondary">Cancel</button>
    <button class="btn-primary">Approve</button>
  </div>
</div>

<!-- Left-side leaflet -->
<div class="leaflet-left">
  <!-- Same structure -->
</div>
```

### Header

Clean navigation header following the mockboard design:

```tsx
import { Header } from '@/components/ui';

<Header
  logoText="weconnect"
  menuItems={[
    { label: 'Home', active: true },
    { label: 'Products', hasDropdown: true },
    { label: 'Integrations', hasDropdown: true },
    { label: 'Pricing' }
  ]}
  user={{
    name: 'John Doe',
    avatar: '/path/to/avatar.jpg',
    email: 'john@company.com'
  }}
  onUpgrade={() => console.log('Upgrade clicked')}
/>
```

## Usage Examples

### Form Layout

```tsx
<Container size="lg">
  <Grid cols={12} gap={2}>
    <GridItem span={6}>
      <Input 
        label="First Name"
        placeholder="Enter first name"
        leftIcon={<UserIcon />}
      />
    </GridItem>
    <GridItem span={6}>
      <Input 
        label="Last Name"
        placeholder="Enter last name"
      />
    </GridItem>
    <GridItem span={12}>
      <Input 
        label="Email"
        type="email"
        placeholder="Enter email address"
        leftIcon={<EmailIcon />}
        divided={true}
      />
    </GridItem>
  </Grid>
  
  <Spacer size={2} />
  
  <div className="flex space-x-4">
    <Button variant="PRIMARY">Save</Button>
    <Button variant="SECONDARY">Cancel</Button>
  </div>
</Container>
```

### Dashboard Layout

```tsx
<div className="min-h-screen bg-gray-50">
  <Header />
  
  <Container size="full">
    <Spacer size={2} />
    
    <Grid cols={12} gap={2}>
      <GridItem span={3}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          Sidebar content
        </div>
      </GridItem>
      <GridItem span={9}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          Main content
        </div>
      </GridItem>
    </Grid>
  </Container>
</div>
```

## Best Practices

1. **Consistent Spacing**: Always use grid-based spacing (multiples of 15px/30px)
2. **Color Usage**: Use semantic color names from the constants
3. **Component Composition**: Build complex layouts using Grid and GridItem components
4. **Responsive Design**: Use Tailwind's responsive classes with the grid system
5. **Accessibility**: Maintain proper contrast ratios and interactive states

## Implementation Notes

- Colors are defined in both Tailwind config and constants for flexibility
- Grid system works with both CSS Grid and Flexbox as needed
- All components support dark mode theming
- Input components handle both controlled and uncontrolled patterns
- Buttons support loading states and icon positioning

This design system ensures consistency across the WeConnect CRM application while maintaining the clean, professional appearance shown in the mockboard.