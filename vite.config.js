import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // When this build ran. Time-boxed content (the home hero promo) renders its
  // first pass from this, not from "now", so the prerendered HTML and the
  // browser's first render agree; the page re-checks the real clock after mount.
  define: { __BUILT_AT__: JSON.stringify(Date.now()) },
})
