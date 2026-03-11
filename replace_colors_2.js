import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = [
  [/bg-slate-400/g, 'bg-plum/50'],
  [/border-slate-100/g, 'border-sand/50'],
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Fixed remaining slate classes!');
