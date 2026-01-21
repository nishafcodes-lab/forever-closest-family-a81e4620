import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Mail, Phone, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format, isValid, parse } from "date-fns";

interface ReunionInfo {
  id: string;
  reunion_date: string | null;
  venue: string | null;
  venue_address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
  countdown_enabled: boolean;
}

const datetimeLocalToUtcIso = (value: string) => {
  if (!value) return null;

  // `datetime-local` emits a local-time string like: 2026-01-21T18:30
  // Safari can be picky with Date parsing, so we parse explicitly.
  const parsed = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
  if (!isValid(parsed)) {
    throw new Error("Invalid date/time. Please select the date again.");
  }

  // Store in UTC (TIMESTAMPTZ) for consistency.
  return parsed.toISOString();
};

const ReunionTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reunionInfo, setReunionInfo] = useState<ReunionInfo | null>(null);
  
  const [formData, setFormData] = useState({
    reunion_date: "",
    venue: "",
    venue_address: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    countdown_enabled: true,
  });

  useEffect(() => {
    fetchReunionInfo();
  }, []);

  const fetchReunionInfo = async () => {
    const { data, error } = await supabase
      .from("reunion_info")
      .select("*")
      .limit(1)
      .single();
    
    if (data) {
      setReunionInfo(data);
      setFormData({
        // Convert stored UTC to a local `datetime-local` value
        reunion_date: data.reunion_date
          ? format(new Date(data.reunion_date), "yyyy-MM-dd'T'HH:mm")
          : "",
        venue: data.venue || "",
        venue_address: data.venue_address || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
        description: data.description || "",
        countdown_enabled: data.countdown_enabled ?? true,
      });
    }

    if (error) {
      toast({ title: "Failed to load reunion info", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!reunionInfo) return;
    
    setSaving(true);

    try {
      const reunion_date = datetimeLocalToUtcIso(formData.reunion_date);

      const { error } = await supabase
        .from("reunion_info")
        .update({
          reunion_date,
          venue: formData.venue || null,
          venue_address: formData.venue_address || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          description: formData.description || null,
          countdown_enabled: formData.countdown_enabled,
          updated_by: user?.id,
        })
        .eq("id", reunionInfo.id);

      if (error) {
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reunion info updated successfully" });
        fetchReunionInfo();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Reunion Info Management</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Reunion Date & Time
            </Label>
            <Input
              type="datetime-local"
              value={formData.reunion_date}
              onChange={(e) => setFormData({ ...formData, reunion_date: e.target.value })}
            />
          </div>
          
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Venue Name
            </Label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Government Graduate College Khanpur"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Venue Address</Label>
          <Input
            value={formData.venue_address}
            onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
            placeholder="Full address of the venue"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Contact Email
            </Label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="contact@email.com"
            />
          </div>
          
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              Contact Phone
            </Label>
            <Input
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+92 300 1234567"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Event Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the reunion event..."
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <Label className="font-medium">Countdown Timer</Label>
            <p className="text-sm text-muted-foreground">Show countdown timer on the website</p>
          </div>
          <Switch
            checked={formData.countdown_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, countdown_enabled: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default ReunionTab;
