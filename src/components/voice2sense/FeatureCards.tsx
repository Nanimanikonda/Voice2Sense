import { Sparkles, Zap, Info } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Text Simplification",
    description: "Complex sentences are automatically simplified for better comprehension",
  },
  {
    icon: Zap,
    title: "Real-Time Translation",
    description: "Captions are instantly translated to your selected Indian language",
  },
  {
    icon: Info,
    title: "Accessibility First",
    description: "Customizable fonts, colors, and contrast for optimal readability",
  },
];

const FeatureCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map((feature) => (
        <div key={feature.title} className="feature-card">
          <div className="flex items-start gap-3">
            <feature.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
