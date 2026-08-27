export interface NeuralCoreConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  nodeCount?: number;
  rotationSpeed?: number;
  enableParallax?: boolean;
  enableBloom?: boolean;
}

export interface NeuralCoreProps extends NeuralCoreConfig {
  headline?: React.ReactNode;
  subheadline?: React.ReactNode;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}
