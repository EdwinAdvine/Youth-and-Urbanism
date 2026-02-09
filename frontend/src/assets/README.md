# Assets Folder

This folder contains all the static assets for the Urban Home School frontend application.

## Folder Structure

- `images/` - Store all your picture files here (PNG, JPG, SVG, etc.)
- `icons/` - Store icon files here
- `fonts/` - Store custom font files here (if needed)

## How to Use Assets in React Components

### Importing Images

```tsx
// Import an image from the assets folder
import myImage from './assets/images/my-picture.jpg';

// Use in your component
function MyComponent() {
  return (
    <div>
      <img src={myImage} alt="My Picture" />
    </div>
  );
}
```

### Using Images with Tailwind CSS

```tsx
import myImage from './assets/images/my-picture.jpg';

function MyComponent() {
  return (
    <div 
      className="bg-cover bg-center h-64"
      style={{ backgroundImage: `url(${myImage})` }}
    >
      {/* Content goes here */}
    </div>
  );
}
```

### Direct Image References

You can also reference images directly in JSX:

```tsx
function MyComponent() {
  return (
    <div>
      <img 
        src="/src/assets/images/my-picture.jpg" 
        alt="My Picture" 
        className="w-full h-auto"
      />
    </div>
  );
}
```

## Supported Image Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)
- SVG (.svg)
- WebP (.webp)
- GIF (.gif)

## Best Practices

1. **Optimize Images**: Compress images before adding them to reduce bundle size
2. **Use Appropriate Formats**: Use WebP for modern browsers, fallback to PNG/JPG
3. **Name Files Clearly**: Use descriptive names with kebab-case (e.g., `student-photo.jpg`)
4. **Organize by Type**: Keep different types of images in appropriate subfolders
5. **Consider SVG for Icons**: Use SVG files for icons and logos when possible