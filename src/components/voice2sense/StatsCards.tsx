import { useState, useEffect } from "react";
import { Clock, MessageSquare, BarChart3, TrendingUp } from "lucide-react";
import { type TranscriptionSegment } from "@/types/voice2sense";

interface StatsCardsProps {
  segments: TranscriptionSegment[];
  sessionStartTime: Date | null;
  isRecording: boolean;
}

const StatsCards = ({ segments, sessionStartTime, isRecording }: StatsCardsProps) => {
  const [elapsed, setElapsed] = useState("0:00");

  useEffect(() => {
    if (!sessionStartTime || !isRecording) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, isRecording]);

  const totalCaptions = segments.length;
  const avgLength = totalCaptions > 0
    ? Math.round(segments.reduce((sum, s) => sum + s.text.length, 0) / totalCaptions)
    : 0;

  // Captions per minute
  let captionRate = 0;
  if (sessionStartTime && totalCaptions > 0) {
    const elapsedMins = (Date.now() - sessionStartTime.getTime()) / 60000;
    captionRate = elapsedMins > 0 ? Math.round(totalCaptions / elapsedMins) : 0;
  }

  const stats = [
    {
      icon: Clock,
      label: "Session Duration",
      value: sessionStartTime ? elapsed : "0:00",
      sub: isRecording ? "Recording" : "Stopped",
    },
    {
      icon: MessageSquare,
      label: "Total Captions",
      value: totalCaptions.toString(),
      sub: `${totalCaptions} captions captured`,
    },
    {
      icon: BarChart3,
      label: "Avg Length",
      value: avgLength.toString(),
      sub: `${avgLength} characters per caption`,
    },
    {
      icon: TrendingUp,
      label: "Caption Rate",
      value: captionRate.toString(),
      sub: "captions per minute",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <stat.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
