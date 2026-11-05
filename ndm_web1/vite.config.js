import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ndm-website1/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        research: resolve(__dirname, 'research/index.html'),
        people: resolve(__dirname, 'people/index.html'),
        resources: resolve(__dirname, 'resources/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        epilepsy: resolve(__dirname, 'research/epilepsy-neuromodulation/index.html'),
        cognition: resolve(__dirname, 'research/cognition-sleep/index.html'),
        neurotech: resolve(__dirname, 'research/neurotechnology/index.html'),
        cancer: resolve(__dirname, 'research/cancer-neuroscience/index.html'),
        ai: resolve(__dirname, 'research/ai-neurology/index.html'),
      },
    },
  },
});
