import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const ThemeContext = createContext();

export const themes = {
  Classic: {
    mode: "light",
    bg: "#E9F4FF",
    sidebarBg: "#E9F4FF",
    sidebarText: "#1956AC",
    cardBg: "#FFFFFF",
    text: "#1f2937",
    subText: "#4b5563",
    border: "#e5e7eb",
    accent: "#1956AC",
  },
  Dark: {
    mode: "dark",
    bg: "#111827",
    sidebarBg: "#1f2937",
    sidebarText: "#93C5FD",
    cardBg: "#1f2937",
    text: "#F9FAFB",
    subText: "#D1D5DB",
    border: "#374151",
    accent: "#3B82F6",
  },
  Nature: {
    mode: "light",
    bg: "#F1F8E9",
    sidebarBg: "#F1F8E9",
    sidebarText: "#33691E",
    cardBg: "#FFFFFF",
    text: "#1B5E20",
    subText: "#558B2F",
    border: "#C5E1A5",
    accent: "#558B2F",
  },
};

/* Curated preset background images (royalty-free from Unsplash) */
export const PRESET_BACKGROUNDS = [
  { label: "Mountain Lake", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" },
  { label: "Ocean Sunset", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80" },
  { label: "Forest Path", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80" },
  { label: "Night Sky", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80" },
  { label: "Cherry Blossom", url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80" },
  { label: "Desert Dunes", url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80" },
  { label: "Aurora Borealis", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80" },
  { label: "Autumn Leaves", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80" },
];

export const ThemeProvider = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState("Classic");
  const [backgroundImage, setBackgroundImageState] = useState(null);

  // Load theme + background on first mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeName(savedTheme);
    }
    const savedBg = localStorage.getItem("bnx_bg_image");
    if (savedBg) {
      setBackgroundImageState(savedBg);
    }
  }, []);

  // Sync theme changes
  useEffect(() => {
    const theme = themes[currentThemeName];
    localStorage.setItem("theme", currentThemeName);

    // Tailwind dark mode sync
    document.documentElement.classList.toggle(
      "dark",
      theme.mode === "dark"
    );
  }, [currentThemeName]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentThemeName(themeName);
    }
  };

  const setBackgroundImage = (url) => {
    setBackgroundImageState(url);
    if (url) {
      localStorage.setItem("bnx_bg_image", url);
    } else {
      localStorage.removeItem("bnx_bg_image");
    }
  };

  const clearBackgroundImage = () => {
    setBackgroundImageState(null);
    localStorage.removeItem("bnx_bg_image");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[currentThemeName],
        currentThemeName,
        changeTheme,
        themeNames: Object.keys(themes),
        backgroundImage,
        setBackgroundImage,
        clearBackgroundImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

