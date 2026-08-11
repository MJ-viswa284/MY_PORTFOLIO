const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/environments/environment.ts');
const envConfigFile = `export const environment = {
  production: true,
  geminiApiKey: '${process.env.GEMINI_API_KEY || ''}',
  openaiApiKey: '${process.env.OPENAI_API_KEY || ''}',
  alleApiKey: '${process.env.ALLE_API_KEY || ''}',
  groqApiKey: '${process.env.GROQ_API_KEY || ''}'
};
`;

console.log('Inserting Vercel Environment Variables into environment.ts...');

fs.mkdirSync(path.join(__dirname, 'src/environments'), { recursive: true });
fs.writeFileSync(targetPath, envConfigFile);

console.log('environment.ts successfully updated with Vercel secrets.');
