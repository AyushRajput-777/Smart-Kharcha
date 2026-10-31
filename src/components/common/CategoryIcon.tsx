import React from 'react';
import {
  ShoppingBag,
  Coffee,
  Carrot,
  Apple,
  Fuel,
  Flame,
  Zap,
  Smartphone,
  PhoneCall,
  Wifi,
  Droplet,
  CookingPot,
  HeartPulse,
  GraduationCap,
  Shirt,
  Bus,
  Home,
  UtensilsCrossed,
  Layers,
  CircleDot,
  DollarSign,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingBag,
  Coffee,
  Carrot,
  Apple,
  Fuel,
  Flame,
  Zap,
  Smartphone,
  PhoneCall,
  Wifi,
  Droplet,
  CookingPot,
  HeartPulse,
  GraduationCap,
  Shirt,
  Bus,
  Home,
  UtensilsCrossed,
  Layers,
  CircleDot,
  DollarSign,
};

interface CategoryIconProps {
  iconName?: string;
  color?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName = 'Layers',
  color = '#10b981',
  className = '',
  size = 18,
}) => {
  const IconComponent = ICON_MAP[iconName] || Layers;

  return (
    <div
      className={`flex items-center justify-center rounded-xl shrink-0 transition-transform ${className}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
