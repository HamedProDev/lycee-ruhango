import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePrograms, Program } from "@/hooks/usePrograms";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff, Search, Upload, X, GripVertical } from "lucide-react";
import { z } from "zod";

const programSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.string().min(1, "Duration is required"),
  levels: z.string().min(1, "Levels are required"),
  careers: z.string().min(1, "At least one career option is required"),
});

const ProgramsManagement = () => {
  const { programs, isLoading, fetchPrograms, createProgram, updateProgram, deleteProgram } = usePrograms();
  const { isUploading, uploadFile } = useFileUpload();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    levels: "",
    careers: "",
    image_url: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchPrograms(false);
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      levels: "",
      careers: "",
      image_url: "",
      is_active: true,
      display_order: programs.length,
    });
    setErrors({});
    setEditingProgram(null);
    setPreviewImage(null);
  };

  const openEditDialog = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      duration: program.duration,
      levels: program.levels,
      careers: program.careers.join(", "),
      image_url: program.image_url || "",
      is_active: program.is_active,
      display_order: program.display_order,
    });
    setPreviewImage(program.image_url);
    setIsDialogOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, image_url: "Please select an image file" });
      return;
    }

    const { url, error } = await uploadFile(file, "news-images", "programs");
    if (url) {
      setFormData({ ...formData, image_url: url });
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = programSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);

    const programData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: formData.duration.trim(),
      levels: formData.levels.trim(),
      careers: formData.careers.split(",").map((c) => c.trim()).filter(Boolean),
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    if (editingProgram) {
      await updateProgram(editingProgram.id, programData);
    } else {
      await createProgram(programData);
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      await deleteProgram(id);
    }
  };

  const toggleActive = async (program: Program) => {
    await updateProgram(program.id, { is_active: !program.is_active });
  };

  const filteredPrograms = programs.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins text-foreground">Programs Management</h2>
          <p className="text-muted-foreground">Create and manage academic programs</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No programs found matching your search." : "No programs yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrograms.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="max-w-xs">
                          <p className="font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.levels}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.duration}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(item)}
                          title={item.is_active ? "Deactivate" : "Activate"}
                        >
                          {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              {editingProgram ? "Edit Program" : "Create Program"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Computer Application"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students will learn..."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3 Years"
                  className={errors.duration ? "border-destructive" : ""}
                />
                {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="levels">Levels *</Label>
                <Input
                  id="levels"
                  value={formData.levels}
                  onChange={(e) => setFormData({ ...formData, levels: e.target.value })}
                  placeholder="e.g., Level 3, 4, 5"
                  className={errors.levels ? "border-destructive" : ""}
                />
                {errors.levels && <p className="text-sm text-destructive">{errors.levels}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="careers">Career Opportunities *</Label>
              <Input
                id="careers"
                value={formData.careers}
                onChange={(e) => setFormData({ ...formData, careers: e.target.value })}
                placeholder="Separate with commas: Chef, Restaurant Manager, Catering Manager"
                className={errors.careers ? "border-destructive" : ""}
              />
              {errors.careers && <p className="text-sm text-destructive">{errors.careers}</p>}
            </div>

            <div className="space-y-2">
              <Label>Program Image</Label>
              <div className="flex gap-4 items-start">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData({ ...formData, image_url: "" });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Upload an image or enter a URL below
                  </p>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setPreviewImage(e.target.value || null);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active (visible on website)</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingProgram ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsManagement;
