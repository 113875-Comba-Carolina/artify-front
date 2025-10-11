import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'alberta-postsymphysial-buddy.ngrok-free.dev',
      'treasurable-almeda-unsimply.ngrok-free.dev'
    ],
    host: true
  }
});
