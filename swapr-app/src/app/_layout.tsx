import { ConnectionGate } from '@/components/connection-gate';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SwapProvider } from '@/components/swapr';
import { AppThemeProvider, useAppTheme } from '@/components/app-theme';
function Navigation() {
 const reduced=useReducedMotion();
 const {colors,isDark} = useAppTheme();
 return <ConnectionGate><StatusBar style={isDark?'light':'dark'}/><Stack screenOptions={{headerShown:false,animation:reduced?'none':'slide_from_right',contentStyle:{backgroundColor:colors.background}}}/></ConnectionGate>;
}
export default function Layout() {return <AppThemeProvider><SwapProvider><Navigation/></SwapProvider></AppThemeProvider>;}
