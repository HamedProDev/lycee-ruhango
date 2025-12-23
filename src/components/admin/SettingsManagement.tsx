import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings, SchoolInfo, SocialLinks, AdmissionsSettings } from "@/hooks/useSettings";
import { Loader2, Save, School, Globe, BookOpen } from "lucide-react";

const SettingsManagement = () => {
  const { settings, isLoading, fetchSettings, getSetting, updateSetting } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"school" | "social" | "admissions">("school");

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
  });

  const [admissionsSettings, setAdmissionsSettings] = useState<AdmissionsSettings>({
    is_open: true,
    deadline: null,
    requirements: [],
  });

  const [requirementsText, setRequirementsText] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.length > 0) {
      const schoolData = getSetting("school_info", { name: "", phone: "", email: "", address: "" }) as Record<string, string>;
      setSchoolInfo({
        name: schoolData.name || "",
        phone: schoolData.phone || "",
        email: schoolData.email || "",
        address: schoolData.address || "",
      });

      const socialData = getSetting("social_links", { facebook: "", twitter: "", instagram: "", youtube: "" }) as Record<string, string>;
      setSocialLinks({
        facebook: socialData.facebook || "",
        twitter: socialData.twitter || "",
        instagram: socialData.instagram || "",
        youtube: socialData.youtube || "",
      });

      const admData = getSetting("admissions", { is_open: true, deadline: null, requirements: [] }) as Record<string, any>;
      setAdmissionsSettings({
        is_open: admData.is_open ?? true,
        deadline: admData.deadline || null,
        requirements: admData.requirements || [],
      });
      setRequirementsText((admData.requirements || []).join("\n"));
    }
  }, [settings]);

  const handleSaveSchoolInfo = async () => {
    setIsSaving(true);
    await updateSetting("school_info", JSON.parse(JSON.stringify(schoolInfo)));
    setIsSaving(false);
  };

  const handleSaveSocialLinks = async () => {
    setIsSaving(true);
    await updateSetting("social_links", JSON.parse(JSON.stringify(socialLinks)));
    setIsSaving(false);
  };

  const handleSaveAdmissions = async () => {
    setIsSaving(true);
    const requirements = requirementsText.split("\n").map((r) => r.trim()).filter(Boolean);
    await updateSetting("admissions", JSON.parse(JSON.stringify({
      ...admissionsSettings,
      requirements,
    })));
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-poppins text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage school information and website settings</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <Button
          variant={activeTab === "school" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("school")}
          className="rounded-b-none"
        >
          <School className="w-4 h-4 mr-2" />
          School Info
        </Button>
        <Button
          variant={activeTab === "social" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("social")}
          className="rounded-b-none"
        >
          <Globe className="w-4 h-4 mr-2" />
          Social Links
        </Button>
        <Button
          variant={activeTab === "admissions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("admissions")}
          className="rounded-b-none"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Admissions
        </Button>
      </div>

      {activeTab === "school" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              School Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">School Name</Label>
              <Input
                id="school_name"
                value={schoolInfo.name}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                placeholder="School name"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school_phone">Phone</Label>
                <Input
                  id="school_phone"
                  value={schoolInfo.phone}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                  placeholder="+250 788 123 456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school_email">Email</Label>
                <Input
                  id="school_email"
                  type="email"
                  value={schoolInfo.email}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                  placeholder="info@school.rw"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_address">Address</Label>
              <Textarea
                id="school_address"
                value={schoolInfo.address}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                placeholder="District, Province, Rwanda"
                rows={2}
              />
            </div>
            <Button onClick={handleSaveSchoolInfo} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "social" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </div>
            <Button onClick={handleSaveSocialLinks} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "admissions" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Admissions Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id="admissions_open"
                checked={admissionsSettings.is_open}
                onCheckedChange={(checked) =>
                  setAdmissionsSettings({ ...admissionsSettings, is_open: checked })
                }
              />
              <Label htmlFor="admissions_open">Admissions Open</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={admissionsSettings.deadline || ""}
                onChange={(e) =>
                  setAdmissionsSettings({ ...admissionsSettings, deadline: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Admission Requirements (one per line)</Label>
              <Textarea
                id="requirements"
                value={requirementsText}
                onChange={(e) => setRequirementsText(e.target.value)}
                placeholder="Valid ID or passport&#10;Previous school report&#10;Application fee receipt"
                rows={5}
              />
            </div>
            <Button onClick={handleSaveAdmissions} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SettingsManagement;
