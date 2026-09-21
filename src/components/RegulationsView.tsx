import React from 'react';
import { SA_BAIT_LIMITS, SA_GENERAL_REGULATIONS, SA_REGULATORY_SOURCES } from '../data/saRegulations';
import { ShieldCheck, AlertTriangle, Ruler, Compass, ExternalLink } from 'lucide-react';

export const RegulationsView: React.FC = () => {
  const dffePermitUrl = 'https://www.fishing.dffe.gov.za/';

  return (
    <div className="space-y-6">
      
      {/* Regulations Header */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-cyan-950/70 border border-rose-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                South African Marine Regulations & Bait Collection Limits
              </h2>
              <span className="px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                Regulatory reference • verify current permit conditions
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              This is a practical regulatory reference, not a substitute for the current permit conditions or gazetted regulations. DFFE confirmed that the MLRA Regulations are the official and legally binding recreational-fishing instrument; verify the current rules for your species, area and permit before keeping a catch.
            </p>
          </div>
        </div>
      </div>

      {/* Official Permit & Regulation Sources */}
      <div className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                Permit & Official Sources
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Use the official DFFE links to apply, renew, and check the current rules before fishing.
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Legal-source review: 21 September 2026 • MLRA Regulations / Annexure 7 and Annexure 13 checked against DFFE material.
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            OFFICIAL DFFE LINKS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SA_REGULATORY_SOURCES.map((source) => (
            <a
              key={source.title}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {source.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {source.note}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Verification rule */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">When a legal number cannot be verified</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              We deliberately do not publish an unverified hard number. Use the official DFFE source to confirm the current rule for your permit and fishing activity.
            </p>
            <a
              href={dffePermitUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg bg-cyan-900/50 border border-cyan-500/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-900/80"
            >
              Verify with DFFE <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bait Collection Daily Bag Limits Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
              Recreational Inshore Bait Limits
            </h3>
            <p className="text-xs text-slate-400">
              Verified figures below are from MLRA Annexure 13. Other size, method, area and permit conditions may also apply.
            </p>
          </div>
          <span className="text-xs text-amber-400 font-medium">
            Annexure 13 • verify current conditions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SA_BAIT_LIMITS.map((bait) => (
            <div
              key={bait.name}
              className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {bait.name}
                    </h4>
                    <span className="text-[11px] text-cyan-400 italic font-mono block">
                      {bait.scientificName}
                    </span>
                  </div>
                  {bait.verified ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-xs font-bold shrink-0">
                      VERIFIED • {bait.limit}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs font-bold shrink-0">
                      VERIFY WITH DFFE
                    </span>
                  )}
                </div>

                {bait.minimumSize && (
                  <div className="mt-2 text-xs font-semibold text-rose-300 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/50">
                    Size Limit: {bait.minimumSize}
                  </div>
                )}

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  <strong className="text-slate-400">Harvest Rule:</strong> {bait.collectionMethod}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                <strong className="text-slate-300">Verification:</strong> {bait.verificationNote}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                <strong className="text-slate-300">Notes:</strong> {bait.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Catch Cap */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">Overall Daily Fish Limit</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Regulation 22 limits a recreational fisher to <strong className="text-amber-300">10 fish in total per day</strong>, irrespective of species, unless the species has no bag limit or a bag limit exceeding 10. Species-specific bag limits and closed seasons still apply.
            </p>
            <p className="text-[11px] text-slate-500 mt-2">Official source: MLRA Regulations, Regulation 22(7)(f). Always verify the current permit and gazetted rules before retaining fish.</p>
          </div>
        </div>
      </div>

      {/* General Angling Regulations & Permits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm font-['Outfit',sans-serif]">
            <ShieldCheck className="w-4 h-4" />
            <span>Permit Mandates</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {SA_GENERAL_REGULATIONS.permitRequirements.map((rule, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-['Outfit',sans-serif]">
            <Ruler className="w-4 h-4" />
            <span>Legal Measurement</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {SA_GENERAL_REGULATIONS.measuringRules.map((rule, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-['Outfit',sans-serif]">
            <Compass className="w-4 h-4" />
            <span>MPAs & Conservation</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {SA_GENERAL_REGULATIONS.conservationGuidelines.map((rule, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};
