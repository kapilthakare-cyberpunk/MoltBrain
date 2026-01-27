/**
 * Dark Theme
 * 
 * Default dark theme for claude-recall.
 */

import type { Theme } from './ThemeManager.js';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  mode: 'dark',
  colors: {
    bgPrimary: '#0d1117',
    bgSecondary: '#161b22',
    bgTertiary: '#21262d',
    textPrimary: '#e6edf3',
    textSecondary: '#8b949e',
    textMuted: '#6e7681',
    borderColor: '#30363d',
    borderLight: '#21262d',
    accentPrimary: '#58a6ff',
    accentSecondary: '#79c0ff',
    accentSuccess: '#3fb950',
    accentWarning: '#d29922',
    accentError: '#f85149',
    accentInfo: '#a371f7',
  },
  customCss: `
    /* Dark theme specific styles */
    
    /* Observation type colors */
    .observation-type-discovery { color: #58a6ff; }
    .observation-type-decision { color: #a371f7; }
    .observation-type-implementation { color: #3fb950; }
    .observation-type-issue { color: #f85149; }
    .observation-type-learning { color: #d29922; }
    .observation-type-reference { color: #79c0ff; }
    
    /* Code blocks */
    pre, code {
      background: #161b22;
      border: 1px solid #30363d;
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #0d1117;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #484f58;
    }
    
    /* Selection */
    ::selection {
      background: #264f78;
      color: #e6edf3;
    }
    
    /* Focus states */
    *:focus-visible {
      outline: 2px solid #58a6ff;
      outline-offset: 2px;
    }
    
    /* Links */
    a {
      color: #58a6ff;
    }
    
    a:hover {
      color: #79c0ff;
    }
    
    /* Buttons */
    .btn-primary {
      background: #238636;
      color: #ffffff;
    }
    
    .btn-primary:hover {
      background: #2ea043;
    }
    
    .btn-secondary {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
    }
    
    .btn-secondary:hover {
      background: #30363d;
    }
    
    /* Cards */
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
    }
    
    .card:hover {
      border-color: #484f58;
    }
    
    /* Inputs */
    input, textarea, select {
      background: #0d1117;
      border: 1px solid #30363d;
      color: #e6edf3;
    }
    
    input:focus, textarea:focus, select:focus {
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
    }
    
    /* Tables */
    table {
      border-collapse: collapse;
    }
    
    th, td {
      border: 1px solid #30363d;
      padding: 8px 12px;
    }
    
    th {
      background: #161b22;
    }
    
    tr:hover {
      background: #161b22;
    }
  `,
};
