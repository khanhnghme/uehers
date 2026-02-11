import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Listen for close messages from iframe (FilePreview "Quay lại" button)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'close-file-preview') {
        closeFilePreview();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [closeFilePreview]);

  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <FilePreviewContext.Provider value={{ openFilePreview, closeFilePreview }}>
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeFilePreview(); }}>
        <DialogContent
          className="max-w-[96vw] w-[96vw] h-[94vh] max-h-[94vh] p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl [&>button:last-child]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Full-size iframe - loads the exact FilePreview page */}
          <div className="w-full h-full relative">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0 rounded-xl"
                title="File Preview"
              />
            )}
            {/* Floating action button - open in new tab */}
            <div className="absolute bottom-4 right-4 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleOpenInNewTab}
                    className="h-10 w-10 rounded-full shadow-lg border bg-background/95 backdrop-blur-sm hover:bg-background"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Mở trong tab mới</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FilePreviewContext.Provider>
  );
}
