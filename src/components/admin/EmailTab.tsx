import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  name: string;
  email: string | null;
}

const EmailTab = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select("id, name, email")
      .not("email", "is", null)
      .order("name");
    
    if (data) setStudents(data.filter(s => s.email));
    setLoading(false);
  };

  const studentsWithEmail = students.filter(s => s.email);

  const toggleEmail = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmails(studentsWithEmail.map(s => s.email!));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSend = async () => {
    const recipients = formData.to 
      ? formData.to.split(",").map(e => e.trim()).filter(Boolean)
      : selectedEmails;

    if (recipients.length === 0) {
      toast({ title: "No recipients", description: "Please enter email addresses or select students", variant: "destructive" });
      return;
    }

    if (!formData.subject.trim()) {
      toast({ title: "Subject required", variant: "destructive" });
      return;
    }

    if (!formData.message.trim()) {
      toast({ title: "Message required", variant: "destructive" });
      return;
    }

    setSending(true);
    
    try {
      const response = await supabase.functions.invoke("send-email", {
        body: {
          to: recipients,
          subject: formData.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #7c3aed;">BSCS Reunion 2021-2025</h1>
              <div style="white-space: pre-wrap;">${formData.message}</div>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;" />
              <p style="color: #6b7280; font-size: 14px;">
                Government Graduate College Khanpur<br/>
                "Once the worst class, forever the closest family ❤️"
              </p>
            </div>
          `,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({ title: "Email sent successfully!", description: `Sent to ${recipients.length} recipient(s)` });
      setFormData({ to: "", subject: "", message: "" });
      setSelectedEmails([]);
      setSelectAll(false);
    } catch (error: any) {
      toast({ 
        title: "Failed to send email", 
        description: error.message || "Please check your Resend configuration",
        variant: "destructive" 
      });
    }
    
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Send Email</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Form */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              To (comma-separated emails, or select students)
            </Label>
            <Input
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
            />
            {selectedEmails.length > 0 && !formData.to && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedEmails.length} student(s) selected
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Reunion Update - BSCS 2021-2025"
            />
          </div>

          <div>
            <Label className="mb-2 block">Message</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your message here..."
              rows={8}
            />
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </div>

        {/* Student Selection */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students with Email
            </h3>
            <span className="text-sm text-muted-foreground">
              {studentsWithEmail.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : studentsWithEmail.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No students with email addresses yet. Add student emails in the Students tab.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 pb-3 mb-3 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All
                </label>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {studentsWithEmail.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedEmails.includes(student.email!)}
                      onCheckedChange={() => toggleEmail(student.email!)}
                    />
                    <label htmlFor={student.id} className="text-sm cursor-pointer flex-1">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-muted-foreground block text-xs truncate">{student.email}</span>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Templates */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-start"
            onClick={() => setFormData({
              ...formData,
              subject: "🎉 Reunion Announcement - BSCS 2021-2025",
              message: "Dear Classmates,\n\nWe're excited to announce our upcoming class reunion! It's time to meet again and relive the beautiful memories we created together.\n\nPlease save the date and confirm your attendance.\n\nLooking forward to seeing you all!\n\nBest regards,\nBSCS Reunion Committee"
            })}
          >
            <span className="font-medium">Reunion Announcement</span>
            <span className="text-xs text-muted-foreground">General reunion invite</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-start"
            onClick={() => setFormData({
              ...formData,
              subject: "📍 Venue Update - BSCS Reunion",
              message: "Dear Classmates,\n\nWe have an update regarding our reunion venue.\n\n[Add venue details here]\n\nPlease note this change and plan accordingly.\n\nSee you there!\n\nBest regards,\nBSCS Reunion Committee"
            })}
          >
            <span className="font-medium">Venue Update</span>
            <span className="text-xs text-muted-foreground">Location changes</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-start"
            onClick={() => setFormData({
              ...formData,
              subject: "⏰ Reminder - BSCS Reunion This Week!",
              message: "Dear Classmates,\n\nThis is a friendly reminder that our reunion is just around the corner!\n\nDon't forget:\n- Date: [Date]\n- Time: [Time]\n- Venue: [Venue]\n\nWe can't wait to see all of you!\n\nBest regards,\nBSCS Reunion Committee"
            })}
          >
            <span className="font-medium">Event Reminder</span>
            <span className="text-xs text-muted-foreground">Last-minute reminder</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailTab;
