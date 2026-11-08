import { useLocalSearchParams } from 'expo-router';
import { SwapScreen } from '@/components/swapr';
export default function Screen(){const {screen}=useLocalSearchParams<{screen:string}>();return <SwapScreen page={screen}/>;}
