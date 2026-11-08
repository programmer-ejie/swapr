import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon, type IconName } from './app-icon';
import { ItemPhoto } from './item-photo';
import { useAppTheme } from './app-theme';

export function WelcomeScreen(){
 const {colors:c,isDark,toggle}=useAppTheme();
 const {width}=useWindowDimensions();
 const artWidth=Math.min(width-64,340);
 const steps:{icon:IconName;label:string}[]=[{icon:'camera',label:'List it'},{icon:'heart',label:'Match it'},{icon:'swap',label:'Swap it'}];
 return <SafeAreaView style={[s.safe,{backgroundColor:c.background}]}>
  <View style={s.shell}>
   <View style={s.header}>
    <Text accessibilityLabel="Swapr" style={[s.logo,{color:c.primary}]}>swapr<Text style={{color:c.coral}}>.</Text></Text>
    <Pressable accessibilityRole="button" accessibilityLabel={isDark?'Switch to light mode':'Switch to dark mode'} onPress={toggle} style={[s.theme,{backgroundColor:c.mint}]}><AppIcon name={isDark?'sun':'moon'} color={c.primary} size={21}/></Pressable>
   </View>
   <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
    <View style={[s.art,{width:artWidth,height:artWidth*.77}]}>
     <View style={[s.halo,{backgroundColor:c.mint,width:artWidth*.72,height:artWidth*.72,borderRadius:artWidth}]}/>
     <View style={[s.photoCard,{backgroundColor:c.surface,borderColor:c.border,width:artWidth*.48,height:artWidth*.62,left:8,top:15,transform:[{rotate:'-11deg'}]}]}>
      <View style={s.photo}><ItemPhoto title="Everyday headphones"/></View><Text style={[s.photoLabel,{color:c.text}]}>Your old favorite</Text>
     </View>
     <View style={[s.photoCard,{backgroundColor:c.surface,borderColor:c.border,width:artWidth*.48,height:artWidth*.62,right:8,top:35,transform:[{rotate:'10deg'}]}]}>
      <View style={s.photo}><ItemPhoto title="Mirrorless camera"/></View><Text style={[s.photoLabel,{color:c.text}]}>Your next great find</Text>
     </View>
     <View style={[s.swapBadge,{backgroundColor:c.primary,borderColor:c.background}]}><AppIcon name="swap" size={27} color={c.background}/></View>
     <View style={[s.spark,{backgroundColor:c.coral}]}/>
    </View>
    <View style={[s.pill,{backgroundColor:c.mint}]}><View style={[s.dot,{backgroundColor:c.primary}]}/><Text style={[s.eyebrow,{color:c.primary}]}>GOOD THINGS GO AROUND</Text></View>
    <Text accessibilityRole="header" style={[s.title,{color:c.text}]}>Less stuff.{'\n'}<Text style={{color:c.primary}}>More possibility.</Text></Text>
    <Text style={[s.description,{color:c.muted}]}>Trade what you have for something you?ll love.{'\n'}No cash. Just a good swap.</Text>
    <View style={s.steps}>{steps.map((step,i)=><View key={step.label} style={s.stepGroup}>
      {i>0&&<View style={[s.connector,{backgroundColor:c.border}]}/>}
      <View style={s.step}><View style={[s.stepIcon,{backgroundColor:c.surface,borderColor:c.border}]}><AppIcon name={step.icon} size={21} color={c.primary}/></View><Text style={[s.stepText,{color:c.text}]}>{step.label}</Text></View>
    </View>)}</View>
   </ScrollView>
   <View style={[s.actions,{borderTopColor:c.border,backgroundColor:c.background}]}>
    <Pressable accessibilityRole="button" onPress={()=>router.push('/login')} style={({pressed})=>[s.primary,{backgroundColor:c.primary,opacity:pressed?.8:1}]}><Text style={[s.primaryText,{color:c.background}]}>Find your first swap</Text><AppIcon name="right" size={20} color={c.background}/></Pressable>

    <Pressable accessibilityRole="button" onPress={()=>router.replace('/discover')} style={s.guest}><Text style={{color:c.muted,fontSize:12}}>Take a look around first</Text></Pressable>
   </View>
  </View>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1},shell:{flex:1,width:'100%',maxWidth:620,alignSelf:'center'},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:26,paddingTop:12,paddingBottom:8},logo:{fontSize:34,fontWeight:'900',letterSpacing:-2},theme:{width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center'},
 content:{flexGrow:1,alignItems:'center',justifyContent:'center',paddingHorizontal:24,paddingTop:16,paddingBottom:24,gap:18},art:{alignItems:'center',justifyContent:'center'},halo:{position:'absolute',opacity:.8},photoCard:{position:'absolute',borderRadius:18,borderWidth:1,padding:7,shadowColor:'#000',shadowOpacity:.1,shadowOffset:{width:0,height:7},shadowRadius:14,elevation:4},photo:{flex:1,borderRadius:12,overflow:'hidden'},photoLabel:{fontSize:9,fontWeight:'600',textAlign:'center',paddingVertical:9},swapBadge:{position:'absolute',left:'42%',top:'39%',width:56,height:56,borderRadius:20,borderWidth:4,alignItems:'center',justifyContent:'center',transform:[{rotate:'-8deg'}]},spark:{position:'absolute',width:12,height:12,borderRadius:4,right:28,top:12,transform:[{rotate:'20deg'}]},
 pill:{flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:12,paddingVertical:8,borderRadius:20},dot:{height:5,width:5,borderRadius:3},eyebrow:{fontSize:8,fontWeight:'700',letterSpacing:1.4},title:{fontSize:36,lineHeight:42,fontWeight:'800',letterSpacing:-1.5,textAlign:'center'},description:{fontSize:13,lineHeight:21,textAlign:'center'},steps:{flexDirection:'row',justifyContent:'center',alignItems:'center',width:'100%',maxWidth:310,paddingTop:3},stepGroup:{flexDirection:'row',alignItems:'center',flex:1},step:{alignItems:'center',gap:7,flex:1},stepIcon:{width:43,height:43,borderRadius:15,borderWidth:1,alignItems:'center',justifyContent:'center'},stepText:{fontSize:11,fontWeight:'600'},connector:{height:1,width:18,marginBottom:20},
 actions:{paddingHorizontal:26,paddingTop:18,paddingBottom:8,borderTopWidth:1},primary:{minHeight:54,borderRadius:17,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,padding:16},primaryText:{fontSize:14,fontWeight:'700'},login:{minHeight:44,alignItems:'center',justifyContent:'center',paddingTop:4},guest:{alignItems:'center',justifyContent:'center',minHeight:36},
});
