import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" with { type: "json" };

export default defineConfig(({ command, isPreview }) => {
  return {
    plugins: [react()],

    // Dev kører på /
    // Build + preview bruger GitHub Pages-stien
    base: command === "serve" && isPreview !== true ? "/" : pkg.base,
  };
});
