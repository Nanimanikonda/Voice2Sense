import { Sparkles, Zap, Eye, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Text Simplification",
    description:
      "Complex sentences are automatically broken down into simpler, easy-to-read captions for better comprehension by all users.",
  },
  {
    icon: Zap,
    title: "Real-Time Translation",
    description:
      "Spoken words are transcribed and instantly translated into your selected Indian language — Hindi, Telugu, Tamil, and more.",
  },
  {
    icon: Eye,
    title: "Accessibility First",
    description:
      "Customizable font sizes, high-contrast color themes, and speaker labels ensure captions are readable for everyone.",
  },
];

const steps = [
  "Allow microphone access when prompted by your browser.",
  "Choose your spoken (source) language from the header dropdown, or leave it on Auto-detect.",
  "Select one or more target languages you want captions translated into.",
  "Press the Start Recording button and begin speaking clearly.",
  "Watch live captions and translations appear in the display area below.",
  "Use the Settings panel to adjust font size, colors, and audio processing.",
  "Press Stop Recording when finished, then Export your transcript.",
];

const ProductionInfo = () => {
  return (
    <div className="space-y-6">
      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div key={feature.title} className="info-card">
            <div className="flex items-start gap-3">
              <feature.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Step-by-step guide */}
      <div className="info-card">
        <h3 className="font-semibold text-foreground text-sm mb-4">
          How to Use Voice2Sense
        </h3>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ProductionInfo;
