import { AlertCircle } from "lucide-react";

const MicNotice = () => {
  return (
    <div className="info-card">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground text-sm">Microphone Access Required</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please allow microphone access when prompted to start recording. Click "Start Recording" below to request permission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MicNotice;
