import { useAppTheme } from './app-theme';
import type { ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';
const symbols = {
 mail: {ios:'envelope',android:'mail',web:'mail'},
  wifiOff: {ios:'wifi.slash',android:'wifi_off',web:'wifi_off'},
  refresh: {ios:'arrow.clockwise',android:'refresh',web:'refresh'},
  settings: {ios:'gearshape',android:'settings',web:'settings'},
  moon: {ios:'moon',android:'dark_mode',web:'dark_mode'},
  sun: {ios:'sun.max',android:'light_mode',web:'light_mode'},
  list: { ios: 'list.bullet', android: 'view_list', web: 'view_list' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  home: { ios: 'house', android: 'home', web: 'home' },
  discover: { ios: 'safari', android: 'explore', web: 'explore' },
  items: { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' },
  swap: { ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' },
  chat: { ios: 'bubble.left.and.bubble.right', android: 'chat_bubble', web: 'chat_bubble' },
  profile: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  filter: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  heart: { ios: 'heart', android: 'favorite', web: 'favorite' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  back: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
  right: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  down: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  circle: { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  headphones: { ios: 'headphones', android: 'headphones', web: 'headphones' },
  books: { ios: 'books.vertical', android: 'menu_book', web: 'menu_book' },
  bike: { ios: 'bicycle', android: 'directions_bike', web: 'directions_bike' },
  bag: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' },
  shirt: { ios: 'tshirt', android: 'checkroom', web: 'checkroom' },
  pin: { ios: 'mappin.circle', android: 'location_on', web: 'location_on' },
  star: { ios: 'star', android: 'star', web: 'star' },
  starFilled: { ios: 'star.fill', android: 'star', web: 'star' },
  send: { ios: 'paperplane', android: 'send', web: 'send' },
} as const;
export type IconName = keyof typeof symbols;
export function AppIcon({name,size=24,color}:{name:IconName;size?:number;color?:ColorValue}) { const {colors}=useAppTheme(); return <SymbolView name={symbols[name]} size={size} tintColor={color??colors.muted} accessible={false}/>; }
export function itemIcon(title:string):IconName { if(title.includes('lamp')) return 'home'; if(title.includes('camera')) return 'camera'; if(title.includes('headphones')) return 'headphones'; if(title.includes('library')) return 'books'; if(title.includes('cruiser')) return 'bike'; if(title.includes('jacket')) return 'shirt'; return 'bag'; }
