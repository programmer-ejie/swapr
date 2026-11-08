import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { PremiumTabBar } from '@/components/premium-tab-bar';
import { useAppTheme } from '@/components/app-theme';
import { Tabs } from 'expo-router';
import { AppIcon, type IconName } from '@/components/app-icon';
const tabs: {name:string;title:string;icon:IconName}[] = [
{name:'discover',title:'Discover',icon:'discover'},
{name:'items',title:'My Items',icon:'items'},
{name:'matches',title:'Matches',icon:'swap'},
{name:'chats',title:'Chats',icon:'chat'},
{name:'profile',title:'Profile',icon:'profile'},
];
export default function Layout(){const reduced=useReducedMotion();const {colors:palette}=useAppTheme();return <Tabs tabBar={props=><PremiumTabBar {...props}/>} screenOptions={{animation:reduced?'none':'fade',headerShown:false,tabBarActiveTintColor:palette.primary,tabBarInactiveTintColor:palette.muted,tabBarStyle:{backgroundColor:palette.surface,borderTopColor:palette.border},tabBarLabelStyle:{fontSize:10,fontWeight:'600'}}}>{tabs.map(({name,title,icon})=><Tabs.Screen key={name} name={name} options={{title,tabBarIcon:({color})=><AppIcon name={icon} color={color} size={24}/>}}/>)}</Tabs>}
