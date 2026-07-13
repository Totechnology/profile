import {
  AudioWaveform,
  Bot,
  Camera,
  Cpu,
  Film,
  ImageIcon,
  LucideIcon,
  Network,
  Radio,
  Route,
  SlidersHorizontal,
  Sparkles,
  Wrench
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  audio: AudioWaveform,
  bot: Bot,
  camera: Camera,
  cpu: Cpu,
  film: Film,
  image: ImageIcon,
  network: Network,
  radio: Radio,
  route: Route,
  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  wrench: Wrench
};

export function IconFromName({
  name,
  className
}: {
  name?: string;
  className?: string;
}) {
  const Icon = iconMap[name || ""] || Sparkles;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.6} />;
}
