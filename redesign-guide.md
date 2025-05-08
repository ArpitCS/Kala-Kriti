# Kala-Kriti Art Website Redesign Guide

This guide provides instructions on how to redesign the remaining pages of the Kala-Kriti art website using Tailwind CSS while maintaining a clean, modern user interface similar to the reference website (Saatchi Art).

## Directory Structure

The website now has the following structure for components:

- `/views/partials/base-head.ejs` - Common head section with Tailwind CSS CDN setup
- `/views/partials/base-scripts.ejs` - Common JavaScript scripts
- `/views/partials/header.ejs` - Website header with navigation
- `/views/partials/footer.ejs` - Website footer
- `/public/css/header.css` - Empty file (replaced by Tailwind)
- `/public/css/footer.css` - Empty file (replaced by Tailwind)

## How to Redesign the Remaining Pages

Follow these steps for each page you're redesigning:

1. **Start with the base template structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Kala-Kriti | [Page Title]</title>
  <%- include('partials/base-head') %>
</head>
<body class="bg-gray-50">
  <!-- Set the active page for the header -->
  <% locals.page = '[page-name]' %>
  
  <!-- Header -->
  <%- include('partials/header') %>
  
  <!-- Page Content Here -->
  
  <!-- Footer -->
  <%- include('partials/footer') %>
  
  <!-- Common Scripts -->
  <%- include('partials/base-scripts') %>
  
  <!-- Page-specific scripts (if needed) -->
  <script>
    // Your page-specific JavaScript here
  </script>
</body>
</html>
```

2. **Use Tailwind utility classes** for styling instead of custom CSS
3. **Maintain consistent design elements** across pages:
   - Use the same font styles with `font-serif` for headings and `font-sans` for body text
   - Use the color palette: black, white, and shades of gray
   - Use consistent button styles, spacing, and card layouts
   - Use box shadows sparingly for subtle depth (`shadow-sm` and `shadow-md`)

## Common Components & Styles

### Headings
```html
<h1 class="text-4xl md:text-5xl font-semibold mb-4">Page Title</h1>
<h2 class="text-3xl font-semibold mb-3">Section Title</h2>
<h3 class="text-xl font-medium mb-3">Card or Component Title</h3>
```

### Buttons
```html
<!-- Primary Button -->
<a href="/path" class="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors duration-200">Button Text</a>

<!-- Secondary Button -->
<a href="/path" class="px-6 py-3 bg-white text-black font-medium border border-black rounded-md hover:bg-gray-100 transition-colors duration-200">Button Text</a>
```

### Cards
```html
<div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
  <div class="relative group">
    <img src="/path/to/image.jpg" alt="Image Title" class="w-full">
    <!-- Hover Overlay -->
    <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
      <!-- Action buttons here -->
    </div>
  </div>
  <div class="p-4">
    <h3 class="font-medium text-gray-900">Card Title</h3>
    <p class="text-sm text-gray-600 mb-1">Card Description</p>
    <p class="font-medium">$1,250</p>
  </div>
</div>
```

### Grid Layout
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
  <!-- Grid items here -->
</div>
```

### Section Containers
```html
<section class="py-16 bg-white">
  <div class="container mx-auto px-4">
    <!-- Section content here -->
  </div>
</section>
```

## Page-specific Recommendations

### Artists Page
- Use a grid layout for artist profiles
- Include rounded images for artist portraits (`rounded-full`)
- Add filters for artist types/styles
- Consider a featured artist section at the top

### Buy Page
- Implement a robust filter system (price, medium, size, etc.)
- Add a shopping cart button with animation on click
- Consider a "You might also like" section

### Sell Page
- Create a step-by-step guide with icons
- Use a clean form layout with proper spacing
- Add testimonials from successful artists

### Events Page
- Design an event card with date, location, and image
- Implement a calendar view option
- Add a map integration if applicable

### Contact Page
- Create a clean contact form with proper validation states
- Add a Google Maps embed with the location
- Include social media links prominently

### Login/Register Pages
- Create a centered, card-based layout
- Add subtle animations to form interactions
- Include social login options with proper spacing

### Dashboard Page
- Design a clean sidebar navigation
- Create stat cards with appropriate icons
- Use a muted color palette to highlight user content

## Additional Tips

1. **Responsive Design**: Test each page at different screen sizes using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
2. **Hover States**: Add hover effects to interactive elements using Tailwind's `hover:` prefix
3. **Accessibility**: Ensure adequate color contrast and semantic HTML elements
4. **Animation**: Use transition classes for subtle animations (`transition-colors`, `transition-transform`, etc.)
5. **Consistent Spacing**: Use Tailwind's spacing utilities (`m-4`, `p-6`, etc.) consistently across all pages

## Testing Process

After redesigning each page:
1. Check the page at multiple screen sizes
2. Verify that all interactive elements work correctly
3. Ensure the page is visually consistent with other redesigned pages
4. Test the page in different browsers if possible