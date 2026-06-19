import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, HelpCircle, Star, MessageSquare } from "lucide-react";

export default function Tips() {
  const sections = [
    {
      title: "Negative Reviews",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      color: "border-red-500/20 bg-red-500/5",
      tips: [
        "Respond quickly (within 24 hours).",
        "Acknowledge the customer's frustration and apologize genuinely.",
        "Take the conversation offline by providing a phone number or email.",
        "Keep it professional and avoid arguing publicly."
      ]
    },
    {
      title: "Positive Reviews",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: "border-emerald-500/20 bg-emerald-500/5",
      tips: [
        "Express gratitude and mention their specific compliments.",
        "Use the customer's name to personalize the reply.",
        "Subtly mention other products/services if relevant.",
        "Invite them back for another visit."
      ]
    },
    {
      title: "Neutral/Mixed Reviews",
      icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
      color: "border-amber-500/20 bg-amber-500/5",
      tips: [
        "Thank them for the feedback, both good and bad.",
        "Address the specific area of concern.",
        "Highlight steps you are taking to improve.",
        "Maintain a balanced, objective tone."
      ]
    },
    {
      title: "General Best Practices",
      icon: <Star className="w-5 h-5 text-primary" />,
      color: "border-primary/20 bg-primary/5",
      tips: [
        "Keep replies concise and easy to read.",
        "Use your business name naturally in positive replies to help SEO.",
        "Don't copy-paste the exact same response for every review.",
        "Always sound like a human, even when using an AI starting point."
      ]
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-2">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Pro Tips for Replying</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Best practices for managing your online reputation and handling customer feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <Card key={i} className={`border ${section.color} shadow-none overflow-hidden backdrop-blur-sm`}>
              <CardHeader className="pb-3 flex flex-row items-center gap-3 space-y-0 border-b border-inherit">
                {section.icon}
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {section.tips.map((tip, j) => (
                    <li key={j} className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-1.5 shrink-0" />
                      <span className="text-foreground/80 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
