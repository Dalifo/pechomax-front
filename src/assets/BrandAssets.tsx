import { ComponentType } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import LogoWordmarkSvg from '../../assets/LOGO/LOGO.svg';
import LogoPictoSvg from '../../assets/LOGO/picto.svg';
import HomePictoSvg from '../../assets/PICTO/ACCUEIL.svg';
import MapPictoSvg from '../../assets/PICTO/CARTE.svg';
import ForumPictoSvg from '../../assets/PICTO/FORUM.svg';
import MessagesPictoSvg from '../../assets/PICTO/MESSAGERIE.svg';
import ProfilePictoSvg from '../../assets/PICTO/PROFIL.svg';
import { colors } from '../theme/theme';

type SvgAsset = ComponentType<SvgProps>;

export type BrandLogoVariant = 'wordmark' | 'picto';
export type TabAssetName = 'home' | 'map' | 'community' | 'messages' | 'profile';

const logoAssets: Record<BrandLogoVariant, SvgAsset> = {
  wordmark: LogoWordmarkSvg,
  picto: LogoPictoSvg,
};

const tabAssets: Record<TabAssetName, SvgAsset> = {
  home: HomePictoSvg,
  map: MapPictoSvg,
  community: ForumPictoSvg,
  messages: MessagesPictoSvg,
  profile: ProfilePictoSvg,
};

type AssetIconProps = {
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  width?: number;
};

export function BrandLogo({
  color = colors.text,
  height = 34,
  style,
  variant = 'wordmark',
  width = variant === 'wordmark' ? 150 : 34,
}: AssetIconProps & { variant?: BrandLogoVariant }) {
  const Logo = logoAssets[variant];

  return <Logo color={color} fill={color} height={height} style={style} width={width} />;
}

export function TabAssetIcon({
  color = colors.text,
  height = 24,
  name,
  style,
  width = 24,
}: AssetIconProps & { name: TabAssetName }) {
  const Icon = tabAssets[name];

  return <Icon color={color} fill={color} height={height} style={style} width={width} />;
}

export const localAssetPaths = {
  logoWordmark: 'assets/LOGO/LOGO.svg',
  logoPicto: 'assets/LOGO/picto.svg',
  tabHome: 'assets/PICTO/ACCUEIL.svg',
  tabMap: 'assets/PICTO/CARTE.svg',
  tabCommunity: 'assets/PICTO/FORUM.svg',
  tabMessages: 'assets/PICTO/MESSAGERIE.svg',
  tabProfile: 'assets/PICTO/PROFIL.svg',
  futuraBook: 'assets/TYPO/Futura Std Book.ttf',
  futuraBold: 'assets/TYPO/Futura Bold.ttf',
} as const;
