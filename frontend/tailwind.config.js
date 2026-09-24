export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f5f7f8",
        foreground: "#182c35",
        primary: { DEFAULT: "#167466", foreground: "#ffffff" },
        muted: { DEFAULT: "#f1f4f5", foreground: "#697c86" },
        border: "#e2e8eb",
        destructive: "#c34343",
      },
      borderRadius: { lg: "0.85rem", md: "0.55rem" },
    },
  },
  plugins: [],
};
