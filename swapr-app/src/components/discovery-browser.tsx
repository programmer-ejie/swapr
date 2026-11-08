import { ItemPhoto } from './item-photo';
import { useAppTheme } from './app-theme';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon, type IconName } from './app-icon';

export const availableItems = [
  { title: 'Mirrorless camera', category: 'Electronics', distance: '1.2 km', value: '₱500 – ₱1,499' },
  { title: 'Everyday denim jacket', category: 'Fashion', distance: '2.4 km', value: '₱500 – ₱1,499' },
  { title: 'Weekend cruiser', category: 'Outdoors', distance: '3.1 km', value: '₱500 – ₱1,499' },
  { title: 'Minimal desk lamp', category: 'Home', distance: '1.8 km', value: '₱100 – ₱499' },
  { title: 'A little library', category: 'Books & media', distance: '0.8 km', value: '₱100 – ₱499' },
  { title: 'Studio headphones', category: 'Electronics', distance: '2.1 km', value: '₱1,500 – ₱4,999' },
];
const categories: {label:string;icon:IconName}[] = [
  {label:'All',icon:'items'}, {label:'Electronics',icon:'headphones'},
  {label:'Fashion',icon:'shirt'}, {label:'Outdoors',icon:'bike'},
  {label:'Home',icon:'home'}, {label:'Books & media',icon:'books'},
];

export function DiscoveryBrowser({children,onSelect}:{children:ReactNode;onSelect:(index:number)=>void}) {
 const {colors:palette}=useAppTheme(); const styles=useStyles();
  const [mode,setMode] = useState<'Discover'|'List'>('Discover');
  const [category,setCategory] = useState('All');
  const [query,setQuery] = useState('');
  const matches = availableItems.map((item,index)=>({...item,index})).filter(item=>
    (category==='All'||item.category===category) &&
    `${item.title} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())
  );
  function reset() { setCategory('All'); setQuery(''); }
  return <>
    <View style={styles.tabs} accessibilityRole="tablist">
      {(['Discover','List'] as const).map(tab=><Pressable key={tab} accessibilityRole="tab" accessibilityState={{selected:mode===tab}} onPress={()=>setMode(tab)} style={[styles.tab,mode===tab&&styles.selectedTab]}>
        <AppIcon name={tab==='Discover'?'discover':'list'} size={19} color={mode===tab?palette.primary:palette.muted}/>
        <Text style={[styles.tabText,mode===tab&&styles.selectedText]}>{tab}</Text>
      </Pressable>)}
    </View>
    {mode==='Discover'?children:<>
      <View style={{gap:6}}><Text style={styles.heading}>Find your kind of thing.</Text><Text style={styles.caption}>Browse available items from your local circle.</Text></View>
      <View style={styles.search}>
        <AppIcon name="search" size={21}/>
        <TextInput accessibilityLabel="Search available items" placeholder="Search items or categories" placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={styles.searchInput} returnKeyType="search"/>
        {query!==''&&<Pressable accessibilityLabel="Clear search" hitSlop={10} onPress={()=>setQuery('')}><AppIcon name="close" size={18}/></Pressable>}
      </View>
      <View style={{gap:12}}><View style={styles.between}><Text style={styles.label}>ITEM TYPE</Text>{(category!=='All'||query!=='')&&<Pressable accessibilityRole="button" onPress={reset}><Text style={styles.reset}>Reset filters</Text></Pressable>}</View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map(c=><Pressable key={c.label} accessibilityRole="button" accessibilityState={{selected:category===c.label}} onPress={()=>setCategory(c.label)} style={[styles.chip,category===c.label&&styles.activeChip]}>
            <AppIcon name={c.icon} size={17} color={category===c.label?palette.background:palette.muted}/><Text style={[styles.chipText,category===c.label&&{color:palette.background}]}>{c.label}</Text>
          </Pressable>)}
        </ScrollView>
      </View>
      <View style={styles.between}><Text style={styles.resultCount}>{matches.length} {matches.length===1?'item':'items'} available</Text><Text style={styles.caption}>{category==='All'?'All categories':category}</Text></View>
      {matches.map(item=><Pressable key={item.index} accessibilityRole="button" accessibilityLabel={`View ${item.title}`} onPress={()=>onSelect(item.index)} style={({pressed})=>[styles.item,pressed&&{opacity:.65}]}>
        <View style={styles.thumbnail}><ItemPhoto title={item.title}/></View>
        <View style={styles.itemInfo}><Text style={styles.itemCategory}>{item.category}</Text><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.caption}>{item.value}</Text><View style={styles.location}><AppIcon name="pin" size={12} color={palette.muted}/><Text style={styles.caption}>{item.distance} away</Text></View></View>
        <AppIcon name="right" size={20} color={palette.muted}/>
      </Pressable>)}
      {matches.length===0&&<View style={styles.empty}><AppIcon name="search" size={36} color={palette.muted}/><Text style={styles.heading}>No items found</Text><Text style={[styles.caption,{textAlign:'center'}]}>Try another item type or a different search.</Text><Pressable accessibilityRole="button" onPress={reset} style={styles.clearButton}><Text style={styles.reset}>Clear all filters</Text></Pressable></View>}
    </>}
  </>;
}
function useStyles(){const {colors:palette}=useAppTheme(); return StyleSheet.create({
  tabs:{flexDirection:'row',backgroundColor:palette.mint,padding:5,borderRadius:14,gap:5},
  tab:{flex:1,flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center',minHeight:44,borderRadius:10},
  selectedTab:{backgroundColor:palette.surface,borderWidth:1,borderColor:palette.primary},tabText:{fontSize:14,fontWeight:'600',color:palette.muted},selectedText:{color:palette.primary},
  heading:{fontSize:19,fontWeight:'600',color:palette.text,letterSpacing:-.3},caption:{fontSize:12,color:palette.muted,lineHeight:19},
  search:{flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:palette.border,backgroundColor:palette.background,paddingHorizontal:14,borderRadius:13,minHeight:50},searchInput:{flex:1,fontSize:14,color:palette.text,paddingVertical:13},
  between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},label:{fontSize:10,fontWeight:'700',letterSpacing:1.5,color:palette.muted},reset:{fontSize:12,fontWeight:'600',color:palette.text},
  categories:{gap:8,paddingVertical:2},chip:{flexDirection:'row',alignItems:'center',gap:7,borderRadius:22,backgroundColor:palette.mint,paddingHorizontal:14,minHeight:42},activeChip:{backgroundColor:palette.primary},chipText:{fontSize:12,color:palette.muted,fontWeight:'500'},
  resultCount:{fontSize:12,color:palette.text,fontWeight:'600'},item:{backgroundColor:palette.surface,flexDirection:'row',alignItems:'center',gap:13,borderWidth:1,borderColor:palette.border,borderRadius:16,padding:12},thumbnail:{overflow:'hidden',width:72,height:92,borderRadius:11,backgroundColor:palette.border,alignItems:'center',justifyContent:'center'},itemInfo:{flex:1,gap:4},itemCategory:{fontSize:10,color:palette.muted},itemTitle:{fontSize:14,color:palette.text,fontWeight:'600'},location:{flexDirection:'row',alignItems:'center',gap:3},
  empty:{alignItems:'center',gap:12,paddingVertical:30},clearButton:{padding:14,borderRadius:10,backgroundColor:palette.mint},
});
}
