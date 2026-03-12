import { NoteImage } from '@/types/note';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImageAttachmentsProps {
  images: NoteImage[];
  onChange: (images: NoteImage[]) => void;
  readonly?: boolean;
  compact?: boolean;
}

const ImageAttachments = ({ images, onChange, readonly = false, compact = false }: ImageAttachmentsProps) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newImages: NoteImage[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const ext = file.name.split('.').pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
          .from('note-images')
          .upload(path, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('note-images')
          .getPublicUrl(path);

        newImages.push({
          id: crypto.randomUUID(),
          url: publicUrl,
          name: file.name,
        });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        toast.success(`${newImages.length} image(s) uploaded`);
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    onChange(images.filter(img => img.id !== id));
  };

  if (images.length === 0 && readonly) return null;

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {images.map(img => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
              <img
                src={img.url}
                alt={img.name}
                className={`w-full object-cover ${compact ? 'h-16' : 'h-32'}`}
                loading="lazy"
              />
              {!readonly && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${img.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readonly && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading...' : 'Add image'}
          </button>
        </>
      )}
    </div>
  );
};

export default ImageAttachments;
