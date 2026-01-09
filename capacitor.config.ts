import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dronalogitech.whmapping',
  appName: 'Warehouse Mapping',
  webDir: 'out',
  server: {
    url: 'https://wmslifelong.dronalogitech.cloud',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#0f172a',
    // Fix for Android 11+ touch/click issues
    useLegacyBridge: false,
    loggingBehavior: 'debug'
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
