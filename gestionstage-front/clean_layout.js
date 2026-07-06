const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('components/admin/**/*Content.tsx'),
  ...glob.sync('components/entreprise/**/*Content.tsx'),
  ...glob.sync('components/opportunities/*Content.tsx'),
  ...glob.sync('components/profile/*Content.tsx'),
  ...glob.sync('components/applications/*Content.tsx'),
  ...glob.sync('components/dashboard/*Content.tsx'),
  ...glob.sync('components/cv/*Content.tsx'),
  ...glob.sync('components/messages/*Content.tsx'),
  ...glob.sync('components/offers/*Content.tsx')
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove Sidebar imports
  content = content.replace(/import\s+(AdminSidebar|EntrepriseSidebar|Sidebar|MobileNav|TopBar)\s+from\s+[^;]+;/g, '');
  
  // Remove Sidebar components
  content = content.replace(/<(AdminSidebar|EntrepriseSidebar|Sidebar)\s+[^>]*\/>/g, '');
  content = content.replace(/<MobileNav[^>]*\/>/g, '');
  content = content.replace(/<TopBar[^>]*\/>/g, '');
  
  // Replace md:ml-64 with w-full
  content = content.replace(/md:ml-64/g, 'w-full');
  
  // The layout wrapper is usually `<div className="min-h-screen relative overflow-x-hidden bg-surface text-on-surface">`
  // We don't necessarily have to remove it since `UnifiedLayout` sets the `flex` wrapper outside it. 
  // However, `min-h-screen` inside the `flex-1` container might make the page scroll twice if we're not careful.
  // Actually, let's change `min-h-screen` to `h-full` to fit naturally into the `UnifiedLayout` flex container.
  content = content.replace(/className="min-h-screen /g, 'className="h-full w-full ');
  
  fs.writeFileSync(file, content);
  console.log('Processed:', file);
});
