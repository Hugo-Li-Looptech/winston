import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Palette,
  Type,
  Box,
  MousePointerClick,
  FormInput,
  LayoutGrid,
  AlertCircle,
  Table2,
  Navigation,
  ToggleLeft,
  Layers,
  Ruler,
  BookOpen,
  ChevronRight,
  Moon,
  Sun,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ─── Design Tokens (extracted from winston.pen) ─── */
const tokens = {
  colors: {
    primary: { value: "#0066FF", hsl: "215 100% 50%", var: "--primary" },
    "primary-foreground": { value: "#FFFFFF", hsl: "0 0% 100%", var: "--primary-foreground" },
    background: { value: "#FAFAFA", hsl: "0 0% 98%", var: "--background" },
    foreground: { value: "#2D3748", hsl: "220 9% 20%", var: "--foreground" },
    card: { value: "#FFFFFF", hsl: "0 0% 100%", var: "--card" },
    "card-foreground": { value: "#2D3748", hsl: "220 9% 20%", var: "--card-foreground" },
    secondary: { value: "#F4F5F7", hsl: "220 14% 96%", var: "--secondary" },
    "secondary-foreground": { value: "#2D3748", hsl: "220 9% 20%", var: "--secondary-foreground" },
    muted: { value: "#F4F5F7", hsl: "220 14% 96%", var: "--muted" },
    "muted-foreground": { value: "#6B7280", hsl: "220 9% 46%", var: "--muted-foreground" },
    accent: { value: "#F4F5F7", hsl: "220 14% 96%", var: "--accent" },
    "accent-foreground": { value: "#2D3748", hsl: "220 9% 20%", var: "--accent-foreground" },
    destructive: { value: "#E53E3E", hsl: "0 84% 60%", var: "--destructive" },
    "destructive-foreground": { value: "#FFFFFF", hsl: "0 0% 98%", var: "--destructive-foreground" },
    border: { value: "#E5E7EB", hsl: "220 13% 91%", var: "--border" },
    ring: { value: "#0066FF", hsl: "215 100% 50%", var: "--ring" },
    success: { value: "#48BB78", hsl: "145 45% 50%", var: "success" },
    warning: { value: "#F6AD55", hsl: "30 90% 65%", var: "warning" },
    info: { value: "#4299E1", hsl: "207 75% 57%", var: "info" },
  },
  spacing: {
    "spacing-1": 4,
    "spacing-2": 8,
    "spacing-3": 12,
    "spacing-4": 16,
    "spacing-6": 24,
  },
  radii: {
    "radius-sm": 6,
    "radius-md": 8,
    "radius-lg": 12,
  },
  typography: {
    fontFamily: "Inter",
    weights: [
      { label: "Light", value: 300 },
      { label: "Regular", value: 400 },
      { label: "Medium", value: 500 },
      { label: "Semibold", value: 600 },
      { label: "Bold", value: 700 },
    ],
    sizes: [12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48],
  },
};

/* ─── Navigation items ─── */
const navSections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "spacing", label: "Spacing & Radii", icon: Ruler },
  { id: "buttons", label: "Buttons", icon: MousePointerClick },
  { id: "inputs", label: "Inputs & Forms", icon: FormInput },
  { id: "badges", label: "Badges", icon: Layers },
  { id: "toggles", label: "Toggles & Switches", icon: ToggleLeft },
  { id: "cards", label: "Cards", icon: LayoutGrid },
  { id: "feedback", label: "Feedback & Status", icon: AlertCircle },
  { id: "tables", label: "Tables & Data", icon: Table2 },
  { id: "navigation", label: "Navigation", icon: Navigation },
];

/* ─── Copyable color swatch ─── */
function ColorSwatch({ name, hex, hsl }: { name: string; hex: string; hsl: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div
        className="w-10 h-10 rounded-md border shrink-0"
        style={{ backgroundColor: hex }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{hex}</p>
      </div>
      <button
        onClick={() => copy(hex)}
        className="p-1.5 rounded-md hover:bg-accent transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {children}
      <Separator className="mt-10" />
    </section>
  );
}

/* ─── Interactive preview container ─── */
function PreviewBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 flex items-center justify-center gap-4 flex-wrap", className)}>
      {children}
    </div>
  );
}

/* ─── Property control row ─── */
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label className="text-sm font-medium shrink-0 w-32">{label}</Label>
      <div className="flex-1 max-w-xs">{children}</div>
    </div>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */

export default function Guidebook() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isDark, setIsDark] = useState(false);

  // Button playground state
  const [btnVariant, setBtnVariant] = useState<"default" | "secondary" | "outline" | "ghost" | "destructive">("default");
  const [btnSize, setBtnSize] = useState<"default" | "sm" | "lg">("default");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnLabel, setBtnLabel] = useState("Button");

  // Typography playground state
  const [typoWeight, setTypoWeight] = useState(400);
  const [typoSize, setTypoSize] = useState(16);
  const [typoSample, setTypoSample] = useState("The quick brown fox jumps over the lazy dog");

  // Input playground state
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState("Enter text...");

  // Badge playground state
  const [badgeVariant, setBadgeVariant] = useState<"default" | "secondary" | "outline" | "destructive">("default");
  const [badgeLabel, setBadgeLabel] = useState("Badge");

  // Progress playground state
  const [progressValue, setProgressValue] = useState(60);

  // Card playground state
  const [cardTitle, setCardTitle] = useState("Card Title");
  const [cardDesc, setCardDesc] = useState("Card description goes here");

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold tracking-tight">Winston</h1>
          <p className="text-xs text-muted-foreground">Interactive Component Guide</p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {navSections.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-3 border-t">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8 space-y-10">

          {/* ═══ OVERVIEW ═══ */}
          <Section id="overview" title="Winston Design System" description="An interactive reference for all components and design tokens used in the Winston platform.">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-primary">107</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Reusable Components</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-primary">{Object.keys(tokens.colors).length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Color Tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-primary">5</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Font Weights</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ═══ COLORS ═══ */}
          <Section id="colors" title="Colors" description="The full color palette extracted from the design system. Click to copy hex values.">
            <Tabs defaultValue="semantic">
              <TabsList>
                <TabsTrigger value="semantic">Semantic</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="all">All Tokens</TabsTrigger>
              </TabsList>
              <TabsContent value="semantic" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {["primary", "background", "foreground", "card", "secondary", "muted", "accent", "destructive", "border", "ring"].map((key) => {
                    const t = tokens.colors[key as keyof typeof tokens.colors];
                    return t ? <ColorSwatch key={key} name={key} hex={t.value} hsl={t.hsl} /> : null;
                  })}
                </div>
              </TabsContent>
              <TabsContent value="status" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {["success", "warning", "info", "destructive"].map((key) => {
                    const t = tokens.colors[key as keyof typeof tokens.colors];
                    return t ? <ColorSwatch key={key} name={key} hex={t.value} hsl={t.hsl} /> : null;
                  })}
                </div>
              </TabsContent>
              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(tokens.colors).map(([key, t]) => (
                    <ColorSwatch key={key} name={key} hex={t.value} hsl={t.hsl} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ═══ TYPOGRAPHY ═══ */}
          <Section id="typography" title="Typography" description="Inter is the primary typeface. Adjust weight, size, and preview text below.">
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              {/* Controls */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <PropRow label="Font Weight">
                    <Select value={String(typoWeight)} onValueChange={(v) => setTypoWeight(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {tokens.typography.weights.map((w) => (
                          <SelectItem key={w.value} value={String(w.value)}>
                            {w.label} ({w.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PropRow>
                  <PropRow label="Font Size">
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[typoSize]}
                        onValueChange={([v]) => setTypoSize(v)}
                        min={10}
                        max={64}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono text-muted-foreground w-10 text-right">{typoSize}px</span>
                    </div>
                  </PropRow>
                  <PropRow label="Sample Text">
                    <Input value={typoSample} onChange={(e) => setTypoSample(e.target.value)} />
                  </PropRow>
                </CardContent>
              </Card>
              {/* Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <PreviewBox className="min-h-[120px]">
                    <p style={{ fontWeight: typoWeight, fontSize: typoSize }} className="text-foreground leading-snug">
                      {typoSample}
                    </p>
                  </PreviewBox>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs">font-weight: {typoWeight}</Badge>
                    <Badge variant="outline" className="font-mono text-xs">font-size: {typoSize}px</Badge>
                    <Badge variant="outline" className="font-mono text-xs">font-family: Inter</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Type scale */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Type Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokens.typography.sizes.map((size) => (
                  <div key={size} className="flex items-baseline gap-4">
                    <span className="text-xs text-muted-foreground font-mono w-12 shrink-0 text-right">{size}px</span>
                    <p style={{ fontSize: size }} className="text-foreground font-medium truncate">
                      The quick brown fox
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Section>

          {/* ═══ SPACING & RADII ═══ */}
          <Section id="spacing" title="Spacing & Border Radii" description="Consistent spacing and radius tokens from the design system.">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Spacing Scale</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(tokens.spacing).map(([name, value]) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-24 shrink-0">${name}</span>
                      <div className="h-4 bg-primary rounded" style={{ width: value * 4 }} />
                      <span className="text-xs text-muted-foreground">{value}px</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Border Radii</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(tokens.radii).map(([name, value]) => (
                    <div key={name} className="flex items-center gap-4">
                      <span className="text-xs font-mono text-muted-foreground w-24 shrink-0">${name}</span>
                      <div
                        className="w-16 h-16 border-2 border-primary bg-primary/10"
                        style={{ borderRadius: value }}
                      />
                      <span className="text-xs text-muted-foreground">{value}px</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ═══ BUTTONS ═══ */}
          <Section id="buttons" title="Buttons" description="Interactive button playground. Adjust variant, size, label, and disabled state.">
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  <PropRow label="Variant">
                    <Select value={btnVariant} onValueChange={(v: any) => setBtnVariant(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["default", "secondary", "outline", "ghost", "destructive"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PropRow>
                  <PropRow label="Size">
                    <Select value={btnSize} onValueChange={(v: any) => setBtnSize(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["sm", "default", "lg"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PropRow>
                  <PropRow label="Label">
                    <Input value={btnLabel} onChange={(e) => setBtnLabel(e.target.value)} />
                  </PropRow>
                  <PropRow label="Disabled">
                    <Switch checked={btnDisabled} onCheckedChange={setBtnDisabled} />
                  </PropRow>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
                <CardContent>
                  <PreviewBox className="min-h-[100px]">
                    <Button variant={btnVariant} size={btnSize} disabled={btnDisabled}>
                      {btnLabel}
                    </Button>
                  </PreviewBox>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs">variant="{btnVariant}"</Badge>
                    <Badge variant="outline" className="font-mono text-xs">size="{btnSize}"</Badge>
                    {btnDisabled && <Badge variant="outline" className="font-mono text-xs">disabled</Badge>}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* All variants gallery */}
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">All Variants</CardTitle></CardHeader>
              <CardContent>
                <PreviewBox>
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </PreviewBox>
              </CardContent>
            </Card>
          </Section>

          {/* ═══ INPUTS & FORMS ═══ */}
          <Section id="inputs" title="Inputs & Forms" description="Form controls including text inputs, textareas, selects, checkboxes, radio groups, and labeled inputs.">
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  <PropRow label="Placeholder">
                    <Input value={inputPlaceholder} onChange={(e) => setInputPlaceholder(e.target.value)} />
                  </PropRow>
                  <PropRow label="Disabled">
                    <Switch checked={inputDisabled} onCheckedChange={setInputDisabled} />
                  </PropRow>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Input</Label>
                    <Input placeholder={inputPlaceholder} disabled={inputDisabled} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Labeled Input</Label>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input placeholder={inputPlaceholder} disabled={inputDisabled} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Textarea</Label>
                    <Textarea placeholder="Type your message here..." disabled={inputDisabled} />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Select, Checkbox, Radio */}
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Selection Controls</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Select</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select option..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opt1">Option 1</SelectItem>
                        <SelectItem value="opt2">Option 2</SelectItem>
                        <SelectItem value="opt3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Checkboxes</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="c1" defaultChecked />
                        <Label htmlFor="c1" className="text-sm">Checked</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="c2" />
                        <Label htmlFor="c2" className="text-sm">Unchecked</Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Radio Group</Label>
                    <RadioGroup defaultValue="opt1">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="opt1" id="r1" />
                        <Label htmlFor="r1" className="text-sm">Percentage</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="opt2" id="r2" />
                        <Label htmlFor="r2" className="text-sm">Pass / Fail</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="opt3" id="r3" />
                        <Label htmlFor="r3" className="text-sm">Letter Grade</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ═══ BADGES ═══ */}
          <Section id="badges" title="Badges" description="Status badges with configurable variant and label text.">
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  <PropRow label="Variant">
                    <Select value={badgeVariant} onValueChange={(v: any) => setBadgeVariant(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["default", "secondary", "outline", "destructive"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </PropRow>
                  <PropRow label="Label">
                    <Input value={badgeLabel} onChange={(e) => setBadgeLabel(e.target.value)} />
                  </PropRow>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
                <CardContent>
                  <PreviewBox className="min-h-[80px]">
                    <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                  </PreviewBox>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">All Variants</p>
                    <PreviewBox>
                      <Badge variant="default">Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Error</Badge>
                    </PreviewBox>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ═══ TOGGLES & SWITCHES ═══ */}
          <Section id="toggles" title="Toggles & Switches" description="Binary controls for on/off states.">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Switch</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Switch defaultChecked />
                        <span className="text-sm">On</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch />
                        <span className="text-sm">Off</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Toggle</Label>
                    <div className="flex gap-2">
                      <Toggle defaultPressed aria-label="Bold">
                        <Type className="w-4 h-4" />
                      </Toggle>
                      <Toggle aria-label="Italic">
                        <Type className="w-4 h-4" style={{ fontStyle: "italic" }} />
                      </Toggle>
                      <Toggle variant="outline" defaultPressed aria-label="Underline">
                        <Type className="w-4 h-4" />
                      </Toggle>
                      <Toggle variant="outline" aria-label="Strikethrough">
                        <Type className="w-4 h-4" />
                      </Toggle>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Checkbox States</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox defaultChecked />
                        <span className="text-sm">Checked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox />
                        <span className="text-sm">Unchecked</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ═══ CARDS ═══ */}
          <Section id="cards" title="Cards" description="Container components for grouping related content.">
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Controls</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  <PropRow label="Title">
                    <Input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
                  </PropRow>
                  <PropRow label="Description">
                    <Input value={cardDesc} onChange={(e) => setCardDesc(e.target.value)} />
                  </PropRow>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
                <CardContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>{cardTitle}</CardTitle>
                      <CardDescription>{cardDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground">Card content area for any custom content.</p>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button>Button</Button>
                    </CardFooter>
                  </Card>
                </CardContent>
              </Card>
            </div>
            {/* Accordion */}
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Accordion</CardTitle></CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>Yes. It comes with default styles that match the Winston design system.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>Yes. It's animated by default with smooth expand/collapse transitions.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </Section>

          {/* ═══ FEEDBACK & STATUS ═══ */}
          <Section id="feedback" title="Feedback & Status" description="Alerts, progress bars, tooltips, and skeleton loaders.">
            {/* Progress playground */}
            <div className="grid grid-cols-[1fr_1.2fr] gap-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Progress Controls</CardTitle></CardHeader>
                <CardContent>
                  <PropRow label="Value">
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[progressValue]}
                        onValueChange={([v]) => setProgressValue(v)}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono text-muted-foreground w-10 text-right">{progressValue}%</span>
                    </div>
                  </PropRow>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
                <CardContent>
                  <Progress value={progressValue} className="w-full" />
                  <Badge variant="outline" className="font-mono text-xs mt-3">value={progressValue}</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Tooltip & Slider & Skeleton */}
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Other Feedback</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tooltip</Label>
                    <div className="flex justify-center pt-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">Hover me</Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tooltip text</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Slider</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Skeleton</Label>
                    <div className="space-y-2">
                      <div className="h-4 w-48 rounded-md bg-muted animate-pulse-soft" />
                      <div className="h-4 w-32 rounded-md bg-muted animate-pulse-soft" />
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse-soft" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ═══ TABLES & DATA ═══ */}
          <Section id="tables" title="Tables & Data" description="Data presentation with tables, separators, and pagination.">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Table</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">John Doe</TableCell>
                      <TableCell className="text-muted-foreground">john@example.com</TableCell>
                      <TableCell><Badge>Active</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Jane Smith</TableCell>
                      <TableCell className="text-muted-foreground">jane@example.com</TableCell>
                      <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Bob Wilson</TableCell>
                      <TableCell className="text-muted-foreground">bob@example.com</TableCell>
                      <TableCell><Badge variant="destructive">Inactive</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Separators</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Horizontal</Label>
                    <Separator />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Vertical (inline)</Label>
                    <div className="flex items-center gap-4 h-6">
                      <span className="text-sm">Item A</span>
                      <Separator orientation="vertical" />
                      <span className="text-sm">Item B</span>
                      <Separator orientation="vertical" />
                      <span className="text-sm">Item C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ═══ NAVIGATION ═══ */}
          <Section id="navigation" title="Navigation" description="Tabs, breadcrumbs, and navigational patterns from the design system.">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Tabs</CardTitle></CardHeader>
              <CardContent>
                <Tabs defaultValue="account" className="w-full">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="p-4 border rounded-md mt-2">
                    <p className="text-sm text-muted-foreground">Account settings content area.</p>
                  </TabsContent>
                  <TabsContent value="password" className="p-4 border rounded-md mt-2">
                    <p className="text-sm text-muted-foreground">Password settings content area.</p>
                  </TabsContent>
                  <TabsContent value="settings" className="p-4 border rounded-md mt-2">
                    <p className="text-sm text-muted-foreground">General settings content area.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">Breadcrumb</CardTitle></CardHeader>
              <CardContent>
                <nav className="flex items-center gap-1.5 text-sm">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground font-medium">Settings</span>
                </nav>
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader className="pb-3"><CardTitle className="text-base">List Item</CardTitle></CardHeader>
              <CardContent className="p-0">
                {[
                  { title: "Introduction to ML", subtitle: "12 slides • Last edited 2h ago" },
                  { title: "Advanced Algorithms", subtitle: "8 slides • Last edited 5h ago" },
                  { title: "Neural Networks", subtitle: "15 slides • Last edited 1d ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Box className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </Section>

          {/* Bottom padding */}
          <div className="h-20" />
        </div>
      </main>
    </div>
  );
}
