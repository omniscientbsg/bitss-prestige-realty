"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FileUploadInput } from "./FileUploadInput";

export function StringArrayInput({ name, label, defaultValue, placeholder = "" }) {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    try {
      const parsed = typeof defaultValue === 'string' ? JSON.parse(defaultValue || "[]") : (defaultValue || []);
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch { setItems([]); }
  }, [defaultValue]);

  return (
    <div className="bg-dark3 border border-white/10 p-4 rounded-xl space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs text-platinum/50 uppercase font-medium">{label}</label>
        <button type="button" onClick={() => setItems([...items, ""])} className="text-gold text-xs hover:text-[#E8C97A] flex items-center gap-1"><Plus className="w-3 h-3"/> Add Item</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input 
            value={item} 
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value;
              setItems(newItems);
            }}
            className="flex-1 bg-dark2 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-gold/50 focus:outline-none" 
            placeholder={placeholder}
          />
          <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-platinum/50 hover:text-red-400 bg-dark2 border border-white/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
        </div>
      ))}
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

export function ObjectArrayInput({ name, label, defaultValue, fields }) {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    try {
      const parsed = typeof defaultValue === 'string' ? JSON.parse(defaultValue || "[]") : (defaultValue || []);
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch { setItems([]); }
  }, [defaultValue]);

  const handleAdd = () => {
    const newItem = {};
    fields.forEach(f => newItem[f.key] = f.type === 'number' ? 0 : "");
    setItems([...items, newItem]);
  };

  return (
    <div className="bg-dark3 border border-white/10 p-4 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-xs text-platinum/50 uppercase font-medium">{label}</label>
        <button type="button" onClick={handleAdd} className="text-gold text-xs hover:text-[#E8C97A] flex items-center gap-1"><Plus className="w-3 h-3"/> Add Row</button>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-dark2 p-3 rounded-lg border border-white/5 relative group">
            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1 text-platinum/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
              {fields.map(f => (
                <div key={f.key} className={f.fullWidth ? "sm:col-span-2" : ""}>
                  <label className="text-[10px] text-platinum/40 mb-1 block">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea 
                      value={item[f.key] || ""}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx][f.key] = e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-gold/50 focus:outline-none min-h-[60px]"
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <input 
                      type={f.type || "text"}
                      value={item[f.key] || ""}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx][f.key] = f.type === 'number' ? Number(e.target.value) : e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-gold/50 focus:outline-none"
                      placeholder={f.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

export function DeepDiveInput({ name, defaultValue }) {
  const [data, setData] = useState({});
  
  useEffect(() => {
    try {
      const parsed = typeof defaultValue === 'string' ? JSON.parse(defaultValue || "{}") : (defaultValue || {});
      setData(parsed || {});
    } catch { setData({}); }
  }, [defaultValue]);

  const updateField = (key, val) => setData(prev => ({...prev, [key]: val}));

  const addGalleryImage = () => {
    updateField('gallery_images', [...(data.gallery_images || []), ""]);
  };
  const updateGalleryImage = (idx, url) => {
    const newImgs = [...(data.gallery_images || [])];
    newImgs[idx] = url;
    updateField('gallery_images', newImgs);
  };
  const removeGalleryImage = (idx) => {
    const newImgs = [...(data.gallery_images || [])];
    newImgs.splice(idx, 1);
    updateField('gallery_images', newImgs);
  };

  return (
    <div className="bg-dark3 border border-white/10 p-5 rounded-xl space-y-6">
      <label className="text-xs text-platinum/50 uppercase font-medium border-b border-white/5 pb-2 block">Deep Dive Analysis Settings</label>
      
      <div className="space-y-4">
        <h4 className="text-gold text-sm font-medium">Gallery & General</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-platinum/40 block mb-1">Gallery Title</label><input className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.gallery_title || ""} onChange={e => updateField('gallery_title', e.target.value)} /></div>
          <div><label className="text-xs text-platinum/40 block mb-1">Handover Date</label><input className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.handover || ""} onChange={e => updateField('handover', e.target.value)} /></div>
          <div><label className="text-xs text-platinum/40 block mb-1">Map URL</label><input className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.map_url || ""} onChange={e => updateField('map_url', e.target.value)} /></div>
          <div><FileUploadInput defaultValue={data.video_url} onChange={url => updateField('video_url', url)} label="Video URL" /></div>
          
          <div className="col-span-2 space-y-2 mt-2">
            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <label className="text-xs text-platinum/40 block">Gallery Media (Images / MP4)</label>
              <button type="button" onClick={addGalleryImage} className="text-gold text-xs hover:text-[#E8C97A] flex items-center gap-1"><Plus className="w-3 h-3"/> Add Media</button>
            </div>
            {(data.gallery_images || []).map((img, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-dark1/50 p-2 rounded-lg border border-white/5">
                <div className="flex-1">
                  <FileUploadInput defaultValue={img} onChange={url => updateGalleryImage(idx, url)} />
                </div>
                <button type="button" onClick={() => removeGalleryImage(idx)} className="p-2.5 mt-0 text-platinum/50 hover:text-red-400 bg-dark2 border border-white/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-gold text-sm font-medium">Feature Section</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-platinum/40 block mb-1">Feature Title</label><input className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.feature_title || ""} onChange={e => updateField('feature_title', e.target.value)} /></div>
          <div><FileUploadInput defaultValue={data.feature_image} onChange={url => updateField('feature_image', url)} label="Feature Image" /></div>
          <div className="col-span-2"><label className="text-xs text-platinum/40 block mb-1">Feature Description</label><textarea className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.feature_desc || ""} onChange={e => updateField('feature_desc', e.target.value)} rows={2} /></div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-gold text-sm font-medium">Market Data Section</h4>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-platinum/40 block mb-1">Market Title</label><input className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.market_title || ""} onChange={e => updateField('market_title', e.target.value)} /></div>
          <div><FileUploadInput defaultValue={data.market_image} onChange={url => updateField('market_image', url)} label="Market Image" /></div>
          <div className="col-span-2"><label className="text-xs text-platinum/40 block mb-1">Market Description</label><textarea className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.market_desc || ""} onChange={e => updateField('market_desc', e.target.value)} rows={2} /></div>
          <div className="col-span-2"><label className="text-xs text-platinum/40 block mb-1">ROI Text</label><textarea className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.roi_text || ""} onChange={e => updateField('roi_text', e.target.value)} rows={2} /></div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-gold text-sm font-medium">Arbitrage Section</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="text-xs text-platinum/40 block mb-1">Arbitrage Title</label><input className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.arbitrage_title || ""} onChange={e => updateField('arbitrage_title', e.target.value)} /></div>
          <div className="col-span-2"><label className="text-xs text-platinum/40 block mb-1">Arbitrage Body</label><textarea className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm" value={data.arbitrage_body || ""} onChange={e => updateField('arbitrage_body', e.target.value)} rows={3} /></div>
        </div>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(data)} />
    </div>
  );
}

export function ProjectionsInput({ name, defaultValue }) {
  const [data, setData] = useState([0,0,0,0,0,0]);
  useEffect(() => {
    try {
      const parsed = typeof defaultValue === 'string' ? JSON.parse(defaultValue || "[0,0,0,0,0,0]") : (defaultValue || [0,0,0,0,0,0]);
      setData(Array.isArray(parsed) && parsed.length === 6 ? parsed : [0,0,0,0,0,0]);
    } catch { setData([0,0,0,0,0,0]); }
  }, [defaultValue]);

  return (
    <div className="bg-dark3 border border-white/10 p-4 rounded-xl">
      <label className="text-xs text-platinum/50 uppercase font-medium mb-3 block">5-Year Projections</label>
      <div className="grid grid-cols-3 gap-3">
        {data.map((val, idx) => (
          <div key={idx}>
            <label className="text-[10px] text-platinum/40 block mb-1">Year {idx}</label>
            <input type="number" value={val} onChange={e => {
              const newD = [...data]; newD[idx] = Number(e.target.value); setData(newD);
            }} className="w-full bg-dark1 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gold/50" />
          </div>
        ))}
      </div>
      <input type="hidden" name={name} value={JSON.stringify(data)} />
    </div>
  );
}
