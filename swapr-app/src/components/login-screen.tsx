import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from './app-icon';
import { ItemPhoto } from './item-photo';
import { useAppTheme } from './app-theme';

export function LoginScreen(){
 const {colors:c,isDark,toggle}=useAppTheme();
 const [choosing,setChoosing]=useState(false);
 return <SafeAreaView style={[s.safe,{backgroundColor:c.background}]}><View style={s.shell}>
  <View style={s.header}>
   <Pressable accessibilityRole="button" accessibilityLabel="Back to welcome" style={[s.round,{borderColor:c.border}]} onPress={()=>router.replace('/welcome')}><AppIcon name="back" size={20} color={c.text}/></Pressable>
   <Text style={[s.logo,{color:c.primary}]}>swapr<Text style={{color:c.coral}}>.</Text></Text>
   <Pressable accessibilityRole="button" accessibilityLabel={isDark?'Switch to light mode':'Switch to dark mode'} style={[s.round,{borderColor:c.border}]} onPress={toggle}><AppIcon name={isDark?'sun':'moon'} size={20} color={c.text}/></Pressable>
  </View>
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
   <View style={[s.visual,{backgroundColor:c.mint}]}>
    <View style={[s.orbit,{borderColor:c.primary}]}/><View style={[s.orbit,s.smallOrbit,{borderColor:c.primary}]}/>
    <View style={[s.photo,s.leftPhoto,{backgroundColor:c.surface,borderColor:c.border}]}><ItemPhoto title="Everyday headphones"/></View>
    <View style={[s.photo,s.rightPhoto,{backgroundColor:c.surface,borderColor:c.border}]}><ItemPhoto title="Mirrorless camera"/></View>
    <View style={[s.swapMark,{backgroundColor:c.primary,borderColor:c.mint}]}><AppIcon name="swap" size={24} color={c.background}/></View>
    <View style={[s.visualTag,{backgroundColor:c.surface,borderColor:c.border}]}><View style={[s.dot,{backgroundColor:c.coral}]}/><Text style={[s.tagText,{color:c.text}]}>A little less new. A little more you.</Text></View>
   </View>
   <View style={s.intro}>
    <Text style={[s.eyebrow,{color:c.primary}]}>YOUR NEXT CHAPTER, SWAPPED.</Text>
    <Text accessibilityRole="header" style={[s.title,{color:c.text}]}>Good finds.{'\n'}<Text style={{color:c.primary}}>Better connections.</Text></Text>
    <Text style={[s.description,{color:c.muted}]}>Your next great swap starts with an email account.</Text>
   </View>
   <View style={[s.card,{backgroundColor:c.surface,borderColor:c.border,shadowColor:c.primary}]}>
    <View style={s.cardHeading}><View style={[s.mailBadge,{backgroundColor:c.mint}]}><AppIcon name="mail" size={21} color={c.primary}/></View><View style={{flex:1,gap:4}}><Text style={[s.cardTitle,{color:c.text}]}>{choosing?'Choose your account':'Your way in'}</Text><Text style={[s.caption,{color:c.muted}]}>{choosing?'Sample account for this preview':'One email. No extra passwords.'}</Text></View></View>
    {choosing?<>
     <Pressable accessibilityRole="button" accessibilityLabel="Continue with sample account Alex Cruz" onPress={()=>router.replace('/discover')} style={({pressed})=>[s.account,{borderColor:c.border,backgroundColor:pressed?c.mint:c.background}]}>
      <View style={[s.avatar,{backgroundColor:c.mint}]}><Text style={{color:c.primary,fontWeight:'700'}}>AC</Text></View>
      <View style={{flex:1,gap:5}}><Text style={{color:c.text,fontWeight:'600'}}>Alex Cruz</Text><Text style={{color:c.muted,fontSize:12}}>alex@example.com</Text></View><AppIcon name="right" color={c.primary} size={18}/>
     </Pressable>
     <Pressable accessibilityRole="button" onPress={()=>setChoosing(false)} style={s.textButton}><Text style={[s.caption,{color:c.primary,fontWeight:'600'}]}>Back to sign in</Text></Pressable>
    </>:<>
     <Pressable accessibilityRole="button" onPress={()=>setChoosing(true)} style={({pressed})=>[s.button,{backgroundColor:c.primary,opacity:pressed?.85:1,transform:[{scale:pressed?.98:1}]}]}><Text style={[s.buttonText,{color:c.background}]}>Choose an email account</Text><AppIcon name="right" color={c.background} size={19}/></Pressable>
     <Text style={[s.cardFoot,{color:c.muted}]}>New to Swapr? Your profile begins with your first sign-in.</Text>
    </>}
   </View>
   <View style={s.bottomNote}><View style={[s.noteLine,{backgroundColor:c.border}]}/><Text style={[s.eyebrow,{color:c.muted}]}>LESS BUYING. MORE FINDING.</Text><View style={[s.noteLine,{backgroundColor:c.border}]}/></View>
   <Text style={[s.previewNote,{color:c.muted}]}>Demo account only. Email authentication is not connected yet.</Text>
  </ScrollView>
 </View></SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1},shell:{flex:1,width:'100%',maxWidth:540,alignSelf:'center'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:25,paddingTop:14,paddingBottom:10},round:{width:41,height:41,borderRadius:21,borderWidth:1,alignItems:'center',justifyContent:'center'},logo:{fontSize:30,fontWeight:'900',letterSpacing:-1.7},
 content:{flexGrow:1,justifyContent:'center',paddingHorizontal:25,paddingTop:22,paddingBottom:24,gap:25},visual:{height:186,borderRadius:28,overflow:'hidden',alignItems:'center',justifyContent:'center'},orbit:{position:'absolute',width:290,height:290,borderRadius:145,borderWidth:1,opacity:.12},smallOrbit:{width:200,height:200,borderRadius:100},photo:{position:'absolute',width:100,height:122,borderRadius:18,overflow:'hidden',borderWidth:5,top:17},leftPhoto:{left:'15%',transform:[{rotate:'-13deg'}]},rightPhoto:{right:'15%',transform:[{rotate:'12deg'}]},swapMark:{height:48,width:48,borderRadius:17,borderWidth:4,alignItems:'center',justifyContent:'center',position:'absolute',top:54},visualTag:{position:'absolute',bottom:13,borderRadius:20,paddingHorizontal:12,paddingVertical:8,borderWidth:1,flexDirection:'row',gap:7,alignItems:'center'},dot:{width:5,height:5,borderRadius:3},tagText:{fontSize:9,fontWeight:'600'},
 intro:{gap:13},eyebrow:{fontSize:8,letterSpacing:1.6,fontWeight:'700'},title:{fontSize:34,lineHeight:41,letterSpacing:-1.4,fontWeight:'800'},description:{fontSize:14,lineHeight:22,maxWidth:300},card:{padding:20,borderWidth:1,borderRadius:24,gap:19,shadowOffset:{width:0,height:6},shadowOpacity:.045,shadowRadius:16,elevation:2},cardHeading:{flexDirection:'row',alignItems:'center',gap:12},mailBadge:{height:43,width:43,borderRadius:14,alignItems:'center',justifyContent:'center'},cardTitle:{fontSize:16,fontWeight:'700',letterSpacing:-.3},caption:{fontSize:11,lineHeight:17},button:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10,padding:17,borderRadius:15,minHeight:54},buttonText:{fontSize:13,fontWeight:'700',flexShrink:1},cardFoot:{fontSize:11,lineHeight:18,textAlign:'center',paddingHorizontal:8},account:{flexDirection:'row',gap:10,alignItems:'center',padding:12,minHeight:70,borderRadius:15,borderWidth:1},avatar:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center'},textButton:{minHeight:35,alignItems:'center',justifyContent:'center'},bottomNote:{flexDirection:'row',alignItems:'center',gap:12,justifyContent:'center'},noteLine:{height:1,flex:1},previewNote:{fontSize:10,lineHeight:16,textAlign:'center'},
});
