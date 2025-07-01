const fs = require('fs');

// Read the admin portal file
let content = fs.readFileSync('client/src/pages/admin-portal-unified.tsx', 'utf8');

// Replace all toast calls with proper notification calls
// Pattern: toast({ title: "...", description: "...", variant?: "..." })
content = content.replace(/toast\(\s*\{\s*title:\s*"([^"]*)",\s*description:\s*"([^"]*)"(?:,\s*variant:\s*"[^"]*")?\s*\}\s*\);/g, (match, title, description, variant) => {
  if (match.includes('variant: "destructive"')) {
    return `showErrorNotification(\n        "${title}",\n        "${description}"\n      );`;
  } else {
    return `showSuccessNotification(\n        "${title}",\n        "${description}"\n      );`;
  }
});

// Handle multi-line toast calls
content = content.replace(/toast\(\s*\{\s*title:\s*"([^"]*)",\s*description:\s*"([^"]*)",?\s*variant:\s*"([^"]*)",?\s*\}\s*\);/g, (match, title, description, variant) => {
  if (variant === 'destructive') {
    return `showErrorNotification(\n        "${title}",\n        "${description}"\n      );`;
  } else {
    return `showSuccessNotification(\n        "${title}",\n        "${description}"\n      );`;
  }
});

// Write the file back
fs.writeFileSync('client/src/pages/admin-portal-unified.tsx', content);
console.log('Toast replacements completed');