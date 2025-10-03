import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.colexcargo.driver',
  appName: 'Colex Cargo Driver App',
  webDir: 'www',
  android: {
    adjustMarginsForEdgeToEdge: "auto"
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      //launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: "#000000",
     // androidSplashResourceName: "splash",
      //androidScaleType: "FIT_CENTER",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    EdgeToEdge: {
      backgroundColor: "#1a1e3a"
    }
  },
};

export default config;
