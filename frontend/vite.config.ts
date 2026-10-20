import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
	server: {
		// In development the API runs on :5174; proxying keeps requests same-origin,
		// exactly like production, so no CORS setup is needed and cookies just work.
		proxy: {
			"/api": "http://localhost:5174",
		},
	},
});
