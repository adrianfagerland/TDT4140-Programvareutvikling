import { useState, useEffect } from 'react';
import './DarkMode.css'

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggleMode = () => {
    setIsDarkMode(!isDarkMode);
  }
  
  useEffect(() => {
    const body = document.querySelector('body');
    if (isDarkMode) {
      body?.classList.add('dark-mode');
    } else {
      body?.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <button id='darkmode' onClick={handleToggleMode}>
      {isDarkMode ? <img id='lightModeIcon' src="/lightmode.small.png" alt="Toggle Light Mode" /> : <img id='darkModeIcon' src="/darkmode.small.png" alt="Toggle Dark Mode" />}
    </button>
  );
}

export default DarkModeToggle;