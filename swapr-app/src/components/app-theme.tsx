import { createContext, useContext, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palette, darkPalette, type Palette } from '@/constants/palette';
const ThemeContext = createContext<{colors:Palette; isDark:boolean; toggle:()=>void}>(null!);
export function AppThemeProvider({children}:{children:ReactNode}) {
 const system = useColorScheme();
 const [override,setOverride] = useState<boolean|null>(null);
 const isDark = override ?? system === 'dark';
 return <ThemeContext.Provider value={{colors:isDark?darkPalette:palette,isDark,toggle:()=>setOverride(!isDark)}}>{children}</ThemeContext.Provider>;
}
export const useAppTheme = () => useContext(ThemeContext);
