// Keep in sync with /COLOR-PALETTE.txt.
export const palette = {
  primary: '#0F766E',
  mint: '#DDF4EE',
  background: '#FAFAF7',
  surface: '#FFFFFF',
  text: '#202A29',
  muted: '#64716E',
  border: '#E3E8E5',
  coral: '#F4846B',
} as const;

export type Palette = { [Key in keyof typeof palette]: string };
export const darkPalette: Palette = {
 primary: '#5ED5BF', mint: '#183D37', background: '#101917',
 surface: '#192522', text: '#ECF4F0', muted: '#A6BBB3',
 border: '#30453D', coral: '#F4846B',
};
