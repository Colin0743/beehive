import 'dotenv/config';

const envFile = process.env.APP_ENV === 'global' ? '.env.global.local' : '.env.cn.local';
require('dotenv').config({ path: envFile });

module.exports = {
  expo: {
    name: process.env.APP_ENV === 'global' ? "Bee Studio AI" : "蜂巢",
    slug: process.env.APP_ENV === 'global' ? "beestudio-app" : "beehive-app",
    scheme: process.env.APP_ENV === 'global' ? "beestudio" : "beehive",
    version: "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yangyang.beestudio"
    },
    "android": {
      "package": "com.yangyang.beestudio",
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-web-browser"
    ],
    "extra": {
      "supabaseUrl": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "supabaseAnonKey": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      "region": process.env.EXPO_PUBLIC_REGION || "cn"
    }
  }
}