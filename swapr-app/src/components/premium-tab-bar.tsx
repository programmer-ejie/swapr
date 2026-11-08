import { useEffect, useState, type ComponentProps } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { AppIcon, type IconName } from './app-icon';
import { useAppTheme } from './app-theme';

type Props = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
const icons: Record<string,IconName> = {discover:'discover',items:'items',matches:'swap',chats:'chat',profile:'profile'};

export function PremiumTabBar({state,descriptors,emitter,navigateToTab}:Props) {
  const {colors,isDark}=useAppTheme();
  const insets=useSafeAreaInsets();
  const [keyboardOpen,setKeyboardOpen]=useState(false);
  useEffect(()=>{
    const show=Keyboard.addListener('keyboardDidShow',()=>setKeyboardOpen(true));
    const hide=Keyboard.addListener('keyboardDidHide',()=>setKeyboardOpen(false));
    return ()=>{show.remove();hide.remove();};
  },[]);
  if(keyboardOpen) return null;
  return <View style={[styles.dockArea,{backgroundColor:colors.background,paddingBottom:Math.max(insets.bottom,12)}]}>
    <View style={[styles.dock,{backgroundColor:colors.surface,borderColor:colors.border,shadowColor:isDark?'#000':colors.primary}]}>
      {state.routes.map((route,index)=>{
        const active=state.index===index;
        const {options}=descriptors[route.key];
        const label=options.title??route.name;
        const onPress=()=>{
          const event=emitter.emit({type:'tabPress',target:route.key,canPreventDefault:true});
          if(!active&&!event.defaultPrevented) navigateToTab(route.key);
        };
        return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={options.tabBarAccessibilityLabel??label} accessibilityState={{selected:active}} onPress={onPress} onLongPress={()=>emitter.emit({type:'tabLongPress',target:route.key})} style={({pressed})=>[styles.tab,{backgroundColor:active?colors.mint:'transparent',transform:[{scale:pressed?.94:1}]}]}>
          <View style={[styles.iconWrap,active&&styles.activeIcon]}><AppIcon name={icons[route.name]??'items'} size={23} color={active?colors.primary:colors.muted}/></View>
          <Text numberOfLines={1} style={[styles.label,{color:active?colors.primary:colors.muted,fontWeight:active?'700':'500'}]}>{label}</Text>
          <View style={[styles.indicator,{backgroundColor:active?colors.primary:'transparent'}]}/>
        </Pressable>;
      })}
    </View>
  </View>;
}
const styles=StyleSheet.create({
  dockArea:{paddingTop:10,paddingHorizontal:14,alignItems:'center'},
  dock:{width:'100%',maxWidth:560,flexDirection:'row',alignItems:'center',padding:7,gap:3,borderRadius:29,borderWidth:1,shadowOffset:{width:0,height:6},shadowOpacity:.12,shadowRadius:18,elevation:8},
  tab:{flex:1,minHeight:65,borderRadius:22,alignItems:'center',justifyContent:'center',gap:4,paddingHorizontal:2,paddingTop:5,paddingBottom:5},
  iconWrap:{height:25,justifyContent:'center',alignItems:'center'},activeIcon:{transform:[{translateY:-1}]},
  label:{fontSize:10,letterSpacing:.1},indicator:{width:12,height:3,borderRadius:2,marginTop:1},
});
