import React, { useState, useRef } from 'react';
import { FishIdentificationResult, CatchLogEntry } from '../types';
import { SA_FISHING_LOCATIONS } from '../data/saLocations';
import { Camera, Upload, Sparkles, AlertCircle, CheckCircle2, Shield, Info, ArrowRight, RefreshCw, BookPlus } from 'lucide-react';

interface AiSpeciesIdentifierProps {
  onLogCatch: (entry: Partial<CatchLogEntry>) => void;
  defaultLocationName?: string;
}

export const AiSpeciesIdentifier: React.FC<AiSpeciesIdentifierProps> = ({ onLogCatch, defaultLocationName }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [description, setDescription] = useState('');
  const [measuredLength, setMeasuredLength] = useState<string>('');
  const [locationName, setLocationName] = useState(defaultLocationName || 'False Bay');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FishIdentificationResult | null>(null);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleIdentify = async () => {
    if (!selectedImage && !description.trim()) {
      setError('Please upload a catch photo or enter a physical description of the fish.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setLoggedSuccess(false);

    try {
      const response = await fetch('/api/identify-fish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: imageMimeType,
          description: description.trim(),
          userLengthCm: measuredLength ? parseFloat(measuredLength) : undefined,
          locationName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to identify species.');
      }

      const parsed: FishIdentificationResult = await response.json();
      setResult(parsed);
    } catch (err: any) {
      console.error('Identification failed:', err);
      setError(err.message || 'Error communicating with the South African species identification service.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCatchToLogbook = () => {
    if (!result) return;
    onLogCatch({
      speciesName: result.speciesName,
      lengthCm: measuredLength ? parseFloat(measuredLength) : undefined,
      location: locationName,
      notes: `Identified by Gemini AI: ${result.scientificName}. ${result.summary}`,
      photoUrl: selectedImage || undefined,
      // AI legal assessment is never converted into a keep/return decision.
      isLegal: undefined,
    });
    setLoggedSuccess(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border border-amber-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                AI South African Fish & Catch Identifier
              </h2>
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Snap or upload a photo of your catch on the rocks, beach, or boat. The AI assists with species identification; current DFFE legal rules are shown only when independently verified.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section (Upload & Description) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Photo Upload / Camera & Description */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          
          {/* Photo Drag & Drop Zone */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-2">
              Catch Photo (Upload or Camera)
            </label>
            
            {selectedImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-72 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Catch preview"
                  className="max-h-72 w-auto object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/90 text-xs font-semibold text-rose-300 border border-rose-800/50 hover:bg-rose-950 transition"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleImageUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer transition bg-slate-800/40 hover:bg-slate-800/60 flex flex-col items-center justify-center space-y-2"
              >
                <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-cyan-400">Click to upload photo</span> or drag & drop here
                </div>
                <p className="text-[11px] text-slate-500">
                  JPEG, PNG, WebP up to 15MB. Clear side profile of fish works best.
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Text Description / Features Input */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1.5">
              Visual Characteristics or Details (Optional or Alternate)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Silvery body with dark brown blotches along upper half, caught on mud prawn in Breede River, about 42cm long with grunting sound..."
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Catch Measurements & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1">
                Measured Length (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="350"
                value={measuredLength}
                onChange={(e) => setMeasuredLength(e.target.value)}
                placeholder="e.g. 48"
                className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Total length: snout tip to tail tip
              </span>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1">
                Catch Location
              </label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              >
                {SA_FISHING_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name} className="bg-slate-900 text-white">
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleIdentify}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analyzing South African Marine Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Identify Species & View Regulatory Status</span>
              </>
            )}
          </button>

        </div>

        {/* Right Column: AI Analysis Result Display */}
        <div className="lg:col-span-5 flex flex-col">
          {result ? (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in">
              
              {/* Species Identification Header */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Species Identified ({result.confidence} Confidence)
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      result.southAfricanRegulations.sassiStatus.toLowerCase().includes('green')
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : result.southAfricanRegulations.sassiStatus.toLowerCase().includes('red')
                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}
                  >
                    {result.southAfricanRegulations.sassiStatus}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1 font-['Outfit',sans-serif]">
                  {result.speciesName}
                </h3>
                <p className="text-xs text-cyan-300 italic font-mono">
                  {result.scientificName}
                </p>

                {result.localNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.localNames.map((name, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* South African Legal Size Check Box */}
              <div
                className={`p-3.5 rounded-xl border ${
                  result.southAfricanRegulations.isLegalSizeForUser.toLowerCase().includes('undersize') ||
                  result.southAfricanRegulations.isLegalSizeForUser.toLowerCase().includes('illegal') ||
                  result.southAfricanRegulations.isLegalSizeForUser.toLowerCase().includes('prohibited')
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : result.southAfricanRegulations.isLegalSizeForUser.toLowerCase().includes('verify')
                    ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">
                      South African Legal Verification
                    </span>
                    <p className="text-xs mt-1 font-medium leading-relaxed">
                      {result.southAfricanRegulations.isLegalSizeForUser}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] uppercase opacity-75 block">Min Legal Size:</span>
                    <span className="font-bold font-mono">{result.southAfricanRegulations.minimumSizeCm}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase opacity-75 block">Daily Bag Limit:</span>
                    <span className="font-bold font-mono">{result.southAfricanRegulations.dailyBagLimit}</span>
                  </div>
                </div>

                {result.southAfricanRegulations.closedSeason !== 'None' && (
                  <div className="mt-2 text-[11px] font-semibold text-amber-300">
                    ⚠️ Closed Season: {result.southAfricanRegulations.closedSeason}
                  </div>
                )}
              </div>

              {/* Key Diagnostic Features */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Verified Physical Markers
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {result.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Baits & Tactics */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Recommended Baits & Tactics
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.bestBaitsAndTactics.map((b, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-950/60 text-amber-300 rounded border border-amber-800/40 text-[11px]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Handling Advice */}
              <div className="text-xs text-slate-400 leading-relaxed bg-slate-800/30 p-2.5 rounded-lg">
                <strong className="text-slate-200">Handling Tip:</strong> {result.handlingAndConservation}
              </div>

              {/* Add to Catch Logbook Button */}
              <div className="pt-2">
                {loggedSuccess ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved to your Catch Logbook!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddCatchToLogbook}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookPlus className="w-4 h-4" />
                    <span>Log this Catch to Diary</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[300px] border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-900/40 space-y-3">
              <Camera className="w-10 h-10 text-slate-600" />
              <div>
                <h4 className="text-sm font-semibold text-slate-400">Waiting for catch data</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Upload a photo or enter characteristics to identify the fish and view regulatory status in South Africa.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
