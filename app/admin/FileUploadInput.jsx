"use client";
import { useState, useEffect } from "react";
import { Trash2, PlayCircle } from "lucide-react";

export function FileUploadInput({ name, defaultValue, label, onChange }) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);

  // Sync internal state if defaultValue changes externally
  useEffect(() => {
    setUrl(defaultValue || "");
  }, [defaultValue]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setUrl(data.url);
        if(onChange) onChange(data.url);
      } else {
        alert("Upload Failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network Error during upload: " + err.message);
    }
    setUploading(false);
  };

  const handleTextChange = (e) => {
    setUrl(e.target.value);
    if(onChange) onChange(e.target.value);
  };

  const handleClear = () => {
    setUrl("");
    if(onChange) onChange("");
  };

  const isVideo = url && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.ogg'));

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <div className="text-xs text-platinum/50 uppercase tracking-wider">{label}</div>}
      
      {url ? (
        <div className="relative group border border-white/10 rounded-lg overflow-hidden bg-dark1 w-full">
          {isVideo ? (
            <div className="w-full h-32 flex items-center justify-center bg-black relative">
              <video src={url} className="absolute inset-0 w-full h-full object-cover opacity-50" muted />
              <PlayCircle className="w-8 h-8 text-white z-10" />
            </div>
          ) : (
            <img src={url} alt={label || "Upload"} className="w-full h-32 object-cover" />
          )}
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
            <button 
              type="button" 
              onClick={handleClear} 
              className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="text-[10px] text-white bg-black/50 px-2 py-1 rounded truncate max-w-[80%]">{url}</div>
          </div>
          {/* We only render hidden input if 'name' is provided (for native form submission) */}
          {name && <input type="hidden" name={name} value={url} />}
        </div>
      ) : (
        <div className="flex gap-2 items-center w-full">
          <input 
            type="text" 
            name={name} 
            value={url} 
            onChange={handleTextChange} 
            placeholder="URL or click Upload..." 
            className="flex-1 min-w-0 bg-dark3 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-gold/50 focus:outline-none" 
          />
          <label className="flex-shrink-0 bg-dark3 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5 cursor-pointer whitespace-nowrap transition-colors">
            {uploading ? "..." : "Upload"}
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      )}
    </div>
  );
}
