import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qrmenu.kitchenalert',
  appName: 'Kitchen Alert',
  webDir: 'dist/kitchen-alert-mobile/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
