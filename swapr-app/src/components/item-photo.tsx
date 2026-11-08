import { Image } from 'expo-image';
import { View } from 'react-native';
import { AppIcon, itemIcon } from './app-icon';
import { useAppTheme } from './app-theme';

const photos: Record<string, number> = {
  'Mirrorless camera': require('../../assets/items/camera.jpg'),
  'Everyday denim jacket': require('../../assets/items/jacket.jpg'),
  'Weekend cruiser': require('../../assets/items/bicycle.jpg'),
  'Minimal desk lamp': require('../../assets/items/lamp.jpg'),
  'A little library': require('../../assets/items/books.jpg'),
  'Studio headphones': require('../../assets/items/headphones.jpg'),
  'Everyday headphones': require('../../assets/items/headphones.jpg'),
  'Everyday backpack': require('../../assets/items/bag.jpg'),
};
export function ItemPhoto({title}:{title:string}) {
  const {colors:palette}=useAppTheme();
  const source = photos[title];
  if (!source) return <View style={{flex:1,width:'100%',alignItems:'center',justifyContent:'center',backgroundColor:palette.mint}}><AppIcon name={itemIcon(title)} size={36} color={palette.primary}/></View>;
  return <Image source={source} accessibilityLabel={title} contentFit="cover" style={{width:'100%',height:'100%'}}/>;
}
