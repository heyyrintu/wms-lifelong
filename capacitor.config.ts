import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dronalogitech.whmapping',
  appName: 'Warehouse Mapping',
  webDir: 'out',
  server: {
    // Connect to your local dev server
    // Replace with your computer's IP address on local network
    url: 'http://10.5.0.2:3000',  // Use your network IP shown when running npm run dev
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;
