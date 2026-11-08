import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
export function useReducedMotion(){
 const [reduced,setReduced]=useState(true);
 useEffect(()=>{let active=true; AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(active)setReduced(v);}); const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>{active=false;sub.remove();};},[]);
 return reduced;
}
