import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, AppState, Easing, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from './app-theme';
import { AppIcon } from './app-icon';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// Replace this reachability probe with Swapr's health endpoint when a backend exists.
const PROBE='https://www.gstatic.com/generate_204';
export function ConnectionGate({children}:{children:ReactNode}){
 const {colors}=useAppTheme();
 const reduced=useReducedMotion();
 const [status,setStatus]=useState<'checking'|'online'|'unavailable'>('checking');
 const [open,setOpen]=useState(true);
 const controller=useRef<AbortController|null>(null);
 const alive=useRef(true);
 const check=useCallback(async()=>{
   if(controller.current)return;
   const request=new AbortController();controller.current=request;
   setStatus('checking');
   const timeout=setTimeout(()=>request.abort(),7000);
   try{
     const response=await fetch(`${PROBE}?t=${Date.now()}`,{signal:request.signal,cache:'no-store',...(Platform.OS==='web'?{mode:'no-cors' as const}:{})});
     const reachable=response.status===204||response.type==='opaque';
     if(alive.current&&controller.current===request){setStatus(reachable?'online':'unavailable');if(reachable)setOpen(false);}
   }catch{if(alive.current&&controller.current===request)setStatus('unavailable');}
   finally{clearTimeout(timeout);if(controller.current===request)controller.current=null;}
 },[]);
 useEffect(()=>{
   alive.current=true;void check();
   const sub=AppState.addEventListener('change',state=>{if(state==='active')void check();});
   const interval=setInterval(()=>{if(AppState.currentState==='active')void check();},30000);
   return()=>{alive.current=false;controller.current?.abort();controller.current=null;sub.remove();clearInterval(interval);};
 },[check]);
 const motion=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
   if(reduced||!open||status!=='checking'){motion.setValue(0);return;}
   const loop=Animated.loop(Animated.timing(motion,{toValue:1,duration:2200,easing:Easing.linear,useNativeDriver:true}));
   loop.start();return()=>loop.stop();
 },[motion,reduced,open,status]);
 const checking=status==='checking';
 return <View style={{flex:1,backgroundColor:colors.background}}>
   {!open&&status!=='online'&&<SafeAreaView edges={['top']} style={{backgroundColor:colors.mint}}><Pressable accessibilityRole="button" onPress={()=>{setOpen(true);void check();}} style={s.banner}><AppIcon name="wifiOff" size={16}/><Text style={{color:colors.text,fontSize:12}}>{checking?'Checking connection?':'Connection unavailable ? Tap to retry'}</Text></Pressable></SafeAreaView>}
   {children}
   <Modal visible={open} animationType={reduced?'none':'fade'} onRequestClose={()=>setOpen(false)} statusBarTranslucent>
     <SafeAreaView style={[s.screen,{backgroundColor:colors.background}]}>
       <Text style={[s.brand,{color:colors.primary}]}>swapr<Text style={{color:colors.coral}}>.</Text></Text>
       <View style={s.center}>
         <View style={s.mark}>
           <Animated.View style={[s.orbit,{borderColor:colors.border,transform:[{rotate:motion.interpolate({inputRange:[0,1],outputRange:['0deg','360deg']})}]}]}><View style={[s.dot,{backgroundColor:colors.coral}]}/></Animated.View>
           <View style={[s.core,{backgroundColor:colors.mint}]}><AppIcon name={checking?'swap':'wifiOff'} size={42} color={colors.primary}/></View>
         </View>
         <Text style={[s.eyebrow,{color:colors.primary}]}>{checking?'GOOD THINGS ARE CONNECTING':'A LITTLE CONNECTION PAUSE'}</Text>
         <Text accessibilityRole="header" style={[s.title,{color:colors.text}]}>{checking?'Making room for\nsomething good.':'Let?s reconnect.'}</Text>
         <Text accessibilityLiveRegion="polite" style={[s.description,{color:colors.muted}]}>{checking?'Checking your connection. We?ll be right with you.':'We couldn?t verify internet access. Try again, or keep exploring the sample items offline.'}</Text>
         {checking?<View style={s.dots}>{[0,1,2].map(i=><Animated.View key={i} style={{width:6,height:6,borderRadius:3,backgroundColor:colors.primary,opacity:reduced?1:motion.interpolate({inputRange:[0,.3,.65,1],outputRange:i===1?[.3,1,.3,.3]:[1,.3,1,1]})}}/>)}</View>:<Pressable accessibilityRole="button" onPress={()=>void check()} style={[s.retry,{backgroundColor:colors.primary}]}><AppIcon name="refresh" size={18} color={colors.background}/><Text style={{color:colors.background,fontWeight:'700'}}>Try again</Text></Pressable>}
         <Pressable accessibilityRole="button" onPress={()=>setOpen(false)} style={{padding:16}}><Text style={{color:colors.muted,fontSize:13,fontWeight:'600'}}>Continue exploring offline</Text></Pressable>
       </View>
       <Text style={[s.footer,{color:colors.muted}]}>LESS NEW. MORE YOU.</Text>
     </SafeAreaView>
   </Modal>
 </View>;
}
const s=StyleSheet.create({screen:{flex:1,paddingHorizontal:30},brand:{fontSize:34,fontWeight:'900',letterSpacing:-2,marginTop:24,marginLeft:6},center:{flex:1,alignItems:'center',justifyContent:'center',gap:18},mark:{width:156,height:156,alignItems:'center',justifyContent:'center',marginBottom:14},orbit:{position:'absolute',width:156,height:156,borderRadius:78,borderWidth:1},dot:{position:'absolute',width:11,height:11,borderRadius:6,top:-5,left:72},core:{width:112,height:112,borderRadius:36,justifyContent:'center',alignItems:'center',transform:[{rotate:'-8deg'}]},eyebrow:{fontSize:9,fontWeight:'700',letterSpacing:2},title:{fontSize:31,lineHeight:39,fontWeight:'700',letterSpacing:-1,textAlign:'center'},description:{fontSize:14,lineHeight:23,textAlign:'center',maxWidth:310},dots:{flexDirection:'row',gap:8,padding:12},retry:{flexDirection:'row',gap:9,alignItems:'center',justifyContent:'center',padding:17,borderRadius:16,minWidth:190},footer:{textAlign:'center',fontSize:10,letterSpacing:2,paddingBottom:25},banner:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8,padding:10}});
