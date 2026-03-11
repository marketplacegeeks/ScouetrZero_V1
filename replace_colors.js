import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Colors replacement map
const replacements = [
  // Indigo -> Burgundy
  [/bg-indigo-600/g, 'bg-burgundy'],
  [/hover:bg-indigo-700/g, 'hover:bg-burgundy-dark'],
  [/text-indigo-600/g, 'text-burgundy'],
  [/text-indigo-700/g, 'text-burgundy-dark'],
  [/border-indigo-600/g, 'border-burgundy'],
  [/border-indigo-500/g, 'border-burgundy'],
  [/border-indigo-200/g, 'border-burgundy/20'],
  [/border-indigo-100/g, 'border-burgundy/10'],
  [/ring-indigo-600/g, 'ring-burgundy'],
  [/focus:ring-indigo-500/g, 'focus:ring-burgundy'],
  [/bg-indigo-50/g, 'bg-burgundy/5'],
  [/bg-indigo-100/g, 'bg-burgundy/10'],
  [/hover:bg-indigo-50/g, 'hover:bg-burgundy/5'],
  [/hover:bg-indigo-100/g, 'hover:bg-burgundy/10'],
  [/text-indigo-800/g, 'text-burgundy-dark'],
  [/text-indigo-500/g, 'text-burgundy'],
  [/from-indigo-500\/10/g, 'from-burgundy/10'],
  [/to-blue-500\/10/g, 'to-burgundy-dark/10'],

  // Slate/Gray/Black -> Plum/Sand/Canvas
  [/bg-\[\#FAFAFA\]/g, 'bg-canvas'],
  [/bg-gray-50/g, 'bg-canvas'],
  [/bg-slate-50/g, 'bg-canvas'],
  
  [/text-slate-900/g, 'text-plum'],
  [/text-gray-900/g, 'text-plum'],
  [/text-black/g, 'text-plum'],
  
  [/text-slate-800/g, 'text-plum/90'],
  [/text-gray-800/g, 'text-plum/90'],
  
  [/text-slate-700/g, 'text-plum/80'],
  [/text-gray-700/g, 'text-plum/80'],
  
  [/text-slate-600/g, 'text-plum/70'],
  [/text-gray-600/g, 'text-plum/70'],
  
  [/text-slate-500/g, 'text-plum/60'],
  [/text-gray-500/g, 'text-plum/60'],
  
  [/text-slate-400/g, 'text-plum/50'],
  [/text-gray-400/g, 'text-plum/50'],
  
  [/border-slate-200/g, 'border-sand'],
  [/border-gray-200/g, 'border-sand'],
  [/border-\[\#E2E8F0\]/g, 'border-sand'],
  [/border-black\/5/g, 'border-sand'],
  
  [/bg-slate-100/g, 'bg-sand/50'],
  [/bg-gray-100/g, 'bg-sand/50'],
  
  [/bg-slate-200/g, 'bg-sand'],
  [/bg-gray-200/g, 'bg-sand'],
  
  [/hover:bg-slate-100/g, 'hover:bg-sand/50'],
  [/hover:bg-gray-100/g, 'hover:bg-sand/50'],
  
  [/hover:bg-slate-50/g, 'hover:bg-canvas'],
  [/hover:bg-gray-50/g, 'hover:bg-canvas'],
  
  [/bg-black/g, 'bg-plum'],
  [/hover:bg-gray-800/g, 'hover:bg-plum/90'],
  
  [/shadow-black\/10/g, 'shadow-plum/10'],
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Colors replaced successfully!');
