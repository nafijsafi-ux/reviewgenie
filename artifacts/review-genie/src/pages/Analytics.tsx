import React, { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getHistory } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { MessageSquare, Star, TrendingUp, Activity } from "lucide-react";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";

const COLORS = {
  positive: "hsl(142 71% 45%)",
  neutral: "hsl(38 95% 55%)",
  negative: "hsl(0 84% 60%)",
  google: "#3b82f6",
  facebook: "#1d4ed8",
  neither: "hsl(220 15% 40%)"
};

export default function Analytics() {
  const history = getHistory();

  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const sentimentCount = { positive: 0, neutral: 0, negative: 0 };
    const toneCount: Record<string, number> = {};
    const platformCount = { Google: 0, Facebook: 0, Neither: 0 };
    let totalStars = 0;
    let reviewsWithStars = 0;

    history.forEach(entry => {
      sentimentCount[entry.sentiment]++;
      toneCount[entry.tone] = (toneCount[entry.tone] || 0) + 1;
      
      const p = entry.platform || "Neither";
      platformCount[p]++;

      if (entry.starRating > 0) {
        totalStars += entry.starRating;
        reviewsWithStars++;
      }
    });

    // Sentiment Data for Pie
    const sentimentData = [
      { name: "Positive", value: sentimentCount.positive, color: COLORS.positive },
      { name: "Neutral", value: sentimentCount.neutral, color: COLORS.neutral },
      { name: "Negative", value: sentimentCount.negative, color: COLORS.negative },
    ].filter(d => d.value > 0);

    // Tone Data for Bar
    const toneData = Object.entries(toneCount).map(([name, value]) => ({ name, count: value }));

    // Platform Data
    const platformData = [
      { name: "Google", value: platformCount.Google, color: COLORS.google },
      { name: "Facebook", value: platformCount.Facebook, color: COLORS.facebook },
      { name: "Other", value: platformCount.Neither, color: COLORS.neither },
    ].filter(d => d.value > 0);

    // Timeline Data (Last 14 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 14);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const timelineData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = history.filter(e => format(parseISO(e.date), 'yyyy-MM-dd') === dateStr).length;
      return { date: format(day, 'MMM dd'), replies: count };
    });

    return {
      total: history.length,
      avgStars: reviewsWithStars > 0 ? (totalStars / reviewsWithStars).toFixed(1) : "-",
      sentimentData,
      toneData,
      platformData,
      timelineData
    };
  }, [history]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights from your generated responses.</p>
        </div>

        {!stats ? (
          <Card className="border-dashed border-2 bg-transparent text-center py-12">
            <CardContent className="flex flex-col items-center">
              <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No data yet</h2>
              <p className="text-muted-foreground max-w-md">Generate some replies to see your analytics and reputation trends.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Replies</p>
                  <h3 className="text-4xl font-bold">{stats.total}</h3>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
                  <div className="p-3 bg-amber-500/10 rounded-full">
                    <Star className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">Avg. Star Rating</p>
                  <h3 className="text-4xl font-bold">{stats.avgStars}</h3>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Replies Generated (14 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.timelineData}>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="replies" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Sentiment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Tone Usage</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.toneData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Platform Share</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.platformData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stats.platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
