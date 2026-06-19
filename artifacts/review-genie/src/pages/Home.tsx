import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDetectSentiment, useGenerateReply } from "@workspace/api-client-react";
import { getProfile, saveToHistory, HistoryEntry } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Copy, CheckCircle2, AlertCircle, Wand2, Sparkles, Loader2 } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TONES = ["Apologetic", "Grateful", "Professional", "Friendly", "Formal"] as const;

export default function Home() {
  const { toast } = useToast();
  
  // State
  const [reviewText, setReviewText] = useState("");
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedTone, setSelectedTone] = useState<string>("Professional");
  const [businessName, setBusinessName] = useState("");
  const [platform, setPlatform] = useState<"Google" | "Facebook" | "Neither">("Google");
  const [starRating, setStarRating] = useState<number>(0);
  
  // Results
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [detectedSentiment, setDetectedSentiment] = useState<"positive" | "neutral" | "negative" | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // APIs
  const detectSentimentMutation = useDetectSentiment();
  const generateReplyMutation = useGenerateReply();

  // Debounce for sentiment detection
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const profile = getProfile();
    setBusinessName(profile.businessName || "");
    setPlatform(profile.defaultPlatform || "Google");
    setSelectedTone(profile.defaultTone || "Professional");
  }, []);

  useEffect(() => {
    if (!autoDetect) {
      setDetectedSentiment(null);
      return;
    }

    if (reviewText.trim().length > 10) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        detectSentimentMutation.mutate({ data: { reviewText } }, {
          onSuccess: (data) => {
            setDetectedSentiment(data.sentiment);
            setSelectedTone(data.suggestedTone);
            setStarRating(data.starRating);
          }
        });
      }, 800);
    } else {
      setDetectedSentiment(null);
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [reviewText, autoDetect]);

  const handleGenerate = () => {
    if (!reviewText.trim()) {
      toast({ title: "Review text is empty", description: "Please paste a review first.", variant: "destructive" });
      return;
    }
    generateReplyMutation.mutate({
      data: {
        reviewText,
        tone: selectedTone as any,
        businessName: businessName || undefined,
        platform: platform === "Neither" ? undefined : platform,
        starRating: starRating || undefined
      }
    }, {
      onSuccess: (data) => {
        setGeneratedReply(data.reply);
        setDetectedSentiment(data.sentiment);
        setSelectedTone(data.tone);
        setStarRating(data.starRating);
      },
      onError: (err) => {
        toast({ title: "Generation failed", description: err.error?.error || "Unknown error", variant: "destructive" });
      }
    });
  };

  const handleSave = () => {
    if (!generatedReply) return;
    saveToHistory({
      reviewText,
      reply: generatedReply,
      tone: selectedTone,
      sentiment: detectedSentiment || "neutral",
      starRating,
      businessName,
      platform
    });
    toast({ title: "Saved to History", description: "You can view it in the History tab." });
  };

  const handleCopy = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: "Copied!", description: "Reply copied to clipboard." });
  };

  const isLoading = detectSentimentMutation.isPending || generateReplyMutation.isPending;

  return (
    <AppLayout>
      {isLoading && (
        <div className="loading-bar fixed top-0 left-0 h-1 bg-amber-500 z-[9999] w-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
      )}
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 bg-grid-pattern before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] before:pointer-events-none">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Review Management
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Turn Reviews Into <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Loyal Customers</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Paste your customer review below and let AI generate the perfect professional response tailored to your business.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Customer Review</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-detect" checked={autoDetect} onCheckedChange={setAutoDetect} />
                    <Label htmlFor="auto-detect" className="text-sm font-normal text-muted-foreground cursor-pointer">Auto-detect Sentiment</Label>
                  </div>
                </div>
                
                <div className="relative">
                  <Textarea 
                    placeholder="Paste the customer review here..." 
                    className="min-h-[160px] resize-y bg-background/50 focus:bg-background transition-colors"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <AnimatePresence>
                    {detectedSentiment && autoDetect && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-3 right-3"
                      >
                        <Badge variant="outline" className={
                          detectedSentiment === "positive" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          detectedSentiment === "negative" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }>
                          {detectedSentiment === "positive" ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                           detectedSentiment === "negative" ? <AlertCircle className="w-3 h-3 mr-1" /> :
                           <Star className="w-3 h-3 mr-1" />}
                          Detected: {detectedSentiment} — Auto-selected {selectedTone} tone
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setStarRating(star)}
                      className="text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star className={cn("w-6 h-6", starRating >= star ? "fill-amber-500" : "opacity-30")} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">Rating (optional)</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-transform duration-200 border-0"
              onClick={handleGenerate}
              disabled={generateReplyMutation.isPending || !reviewText.trim()}
            >
              {generateReplyMutation.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Magic...</>
              ) : (
                <><Wand2 className="mr-2 h-5 w-5" /> Generate Reply</>
              )}
            </Button>

            <AnimatePresence>
              {generatedReply && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <Card className="border-primary/30 shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex justify-between items-center">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-background/80">
                            Tone: {selectedTone}
                          </Badge>
                          {detectedSentiment && (
                            <Badge variant="outline" className={cn(
                              "bg-background/80",
                              detectedSentiment === "positive" ? "text-emerald-500 border-emerald-500/20" :
                              detectedSentiment === "negative" ? "text-red-500 border-red-500/20" :
                              "text-amber-500 border-amber-500/20"
                            )}>
                              {detectedSentiment}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8" onClick={handleCopy}>
                            {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            {isCopied ? "Copied" : "Copy"}
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 border-primary/20 hover:bg-primary/10" onClick={handleSave}>
                            Save
                          </Button>
                        </div>
                      </div>
                      <div className="p-6 bg-card">
                        <p className="whitespace-pre-wrap leading-relaxed text-[1.05rem]">{generatedReply}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          
          <div className="space-y-6">
            <Card className="bg-sidebar border-border/50">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Response Tone</Label>
                  <Select value={selectedTone} onValueChange={setSelectedTone} disabled={autoDetect && !!reviewText.trim()}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input 
                    placeholder="Your Business LLC" 
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Used in the signature of the reply</p>
                </div>

                <div className="space-y-3">
                  <Label>Platform</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={platform === "Google" ? "default" : "outline"} 
                      className={cn("w-full justify-center px-2 text-sm", platform === "Google" && "bg-blue-600 hover:bg-blue-700 text-white")}
                      onClick={() => setPlatform("Google")}
                    >
                      <SiGoogle className="mr-1.5 shrink-0" /> Google
                    </Button>
                    <Button 
                      variant={platform === "Facebook" ? "default" : "outline"} 
                      className={cn("w-full justify-center px-2 text-sm", platform === "Facebook" && "bg-blue-500 hover:bg-blue-600 text-white")}
                      onClick={() => setPlatform("Facebook")}
                    >
                      <SiFacebook className="mr-1.5 shrink-0" /> Facebook
                    </Button>
                  </div>
                  <Button 
                    variant={platform === "Neither" ? "secondary" : "ghost"} 
                    className="w-full text-xs h-8"
                    onClick={() => setPlatform("Neither")}
                  >
                    Generic / Other
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
