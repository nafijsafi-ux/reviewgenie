import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getProfile, saveProfile, BusinessProfile } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";

const INDUSTRIES = [
  "Retail", "Restaurant / Food", "Healthcare", "Home Services", 
  "Professional Services", "Technology", "Hospitality", "Beauty & Wellness", "Other"
];

const TONES = ["Apologetic", "Grateful", "Professional", "Friendly", "Formal"];

export default function Profile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "",
    industry: "Retail",
    defaultPlatform: "Google",
    defaultTone: "Professional"
  });

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveProfile(profile);
    toast({
      title: "Profile Saved",
      description: "Your business details have been updated."
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
          <p className="text-muted-foreground">Configure default settings for your review responses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>These details inform the AI when generating replies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input 
                  value={profile.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  placeholder="Acme Corp"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={profile.industry} onValueChange={(val) => handleChange("industry", val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Platform</Label>
                <Select value={profile.defaultPlatform} onValueChange={(val) => handleChange("defaultPlatform", val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Neither">Neither / Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Tone</Label>
                <Select value={profile.defaultTone} onValueChange={(val) => handleChange("defaultTone", val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-sidebar border-border/50 h-min">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Profile Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl bg-background border border-border/50 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{profile.businessName || "Your Business Name"}</h3>
                  <p className="text-sm text-muted-foreground">{profile.industry}</p>
                </div>
                
                <div className="h-px w-full bg-border" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Platform:</span>
                    <span className="font-medium flex items-center gap-1">
                      {profile.defaultPlatform === "Google" && <SiGoogle className="text-blue-500 w-3 h-3" />}
                      {profile.defaultPlatform === "Facebook" && <SiFacebook className="text-blue-600 w-3 h-3" />}
                      {profile.defaultPlatform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fallback Tone:</span>
                    <span className="font-medium">{profile.defaultTone}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-primary/80 border border-primary/20">
                  When auto-detect is off, the generator will default to these settings.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
