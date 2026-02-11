import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

interface FilePreviewContextType {
  openFilePreview: (url: string) => void;
  closeFilePreview: () => void;
}

const FilePreviewContext = createContext<FilePreviewContextType | null>(null);

export function useFilePreview() {
  const ctx = useContext(FilePreviewContext);
  if (!ctx) throw new Error('useFilePreview must be used within FilePreviewProvider');
  return ctx;
}

export function FilePreviewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const openFilePreview = useCallback((url: string) => {
    setPreviewUrl(url);
    setIsOpen(true);
  }, []);

  const closeFilePreview = useCallback(() => {
    setIsOpen(false);
    setPreviewUrl('');
  }, []);

  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <FilePreviewContext.Provider value={{ openFilePreview, closeFilePreview }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeFilePreview(); }}>
        <DialogContent
          className="max-w-[95vw] w-[95vw] h-[92vh] max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col [&>button:last-child]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Custom header bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 shrink-0">
            <span className="text-sm font-medium text-muted-foreground">Xem trước file</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="gap-2 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở trong tab mới
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={closeFilePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* iframe loads the actual FilePreview page */}
          <div className="flex-1 min-h-0">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="File Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </FilePreviewContext.Provider>
  );
}
