import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  Camera, ImagePlus, ShieldAlert, CheckCircle2, AlertTriangle, RotateCcw, ChevronRight, Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

/**
 * PhotoCheck — AI check of a waste load from one photo.
 * Is it ready for the Black Soldier Fly larvae? What must be removed? Is there medical waste?
 * The photo goes to a Supabase function that asks Claude; only the result is saved.
 */

type Lang = 'en' | 'sw';
type Verdict = 'ready' | 'sort_first' | 'unsafe';
type CheckResult = {
  image_quality: 'good' | 'poor';
  verdict: Verdict;
  organic_percent: number;
  summary: string;
  contaminants: { item: string; category: string; severity: 'low' | 'medium' | 'high' }[];
  medical_waste: { detected: 'yes' | 'possible' | 'no'; items: { item: string; why: string }[] };
  other_hazards: { item: string; why: string }[];
  actions: string[];
};
type PastCheck = { id: string; created_at: string; verdict: Verdict; medical_flag: 'yes' | 'possible' | 'no'; organic_percent: number; language: Lang; result: CheckResult };

const C = {
  label: '#1D1D1F', secondary: '#6E6E73', tertiary: '#8E8E93', separator: '#E5E5EA',
  tint: '#1E8A5A', green: '#248A3D', orange: '#C25E00', red: '#D70015', fill: '#F2F2F7',
};

// Fixed text — safety instructions are never left to the AI
const T = {
  en: {
    verdict: { ready: 'Ready for the larvae', sort_first: 'Sort it first', unsafe: 'Not safe to process' },
    medicalYes: 'Medical waste found', medicalPossible: 'Possible medical waste',
    medicalLead: 'Don’t sort this load by hand until it’s been checked.',
    safety: [
      'Don’t touch it with bare hands. Use thick gloves or tongs.',
      'Don’t press down on or squeeze the bag. Needles can pierce it.',
      'Put needles and broken glass in a hard container with a lid, such as a thick plastic bottle.',
      'Keep this load away from the larvae, compost and biogas.',
      'Tell your supervisor, and take it to a health facility for safe disposal.',
    ],
    organic: 'Organic share', remove: 'Remove before processing', hazards: 'Other hazards', todo: 'What to do',
    poor: 'The photo is hard to read. Retake it in good light, closer to the waste.',
    disclaimer: 'This is an AI estimate. Always check by eye before handling.',
    severity: { low: 'Minor', medium: 'Remove', high: 'Remove first' },
  },
  sw: {
    verdict: { ready: 'Tayari kwa funza', sort_first: 'Chambua kwanza', unsafe: 'Si salama kuchakata' },
    medicalYes: 'Taka za kitabibu zimeonekana', medicalPossible: 'Huenda kuna taka za kitabibu',
    medicalLead: 'Usichambue mzigo huu kwa mikono kabla haujakaguliwa.',
    safety: [
      'Usiguse kwa mikono mitupu. Tumia glovu nzito au koleo.',
      'Usibonyeze wala kukandamiza mfuko. Sindano zinaweza kuutoboa.',
      'Weka sindano na vioo vilivyovunjika kwenye chombo kigumu chenye mfuniko, kama chupa nene ya plastiki.',
      'Usiweke mzigo huu kwenye funza, mboji wala biogesi.',
      'Mjulishe msimamizi wako, na upeleke kwenye kituo cha afya kwa utupaji salama.',
    ],
    organic: 'Sehemu ya taka-ozo', remove: 'Ondoa kabla ya kuchakata', hazards: 'Hatari nyingine', todo: 'Hatua za kuchukua',
    poor: 'Picha haionekani vizuri. Piga tena kwenye mwanga mzuri, karibu na taka.',
    disclaimer: 'Haya ni makadirio ya AI. Kagua kwa macho kila mara kabla ya kushika.',
    severity: { low: 'Ndogo', medium: 'Ondoa', high: 'Ondoa kwanza' },
  },
};

// A worked example for demos (no AI call, no cost)
const EXAMPLE: CheckResult = {
  image_quality: 'good',
  verdict: 'unsafe',
  organic_percent: 70,
  summary: 'Mostly market produce waste, but there is a syringe and a medicine blister pack mixed in.',
  contaminants: [
    { item: 'Plastic carrier bags', category: 'plastic', severity: 'medium' },
    { item: 'Water sachets', category: 'plastic', severity: 'low' },
  ],
  medical_waste: {
    detected: 'yes',
    items: [
      { item: 'Syringe with needle', why: 'Can cause needle-stick injury and infection' },
      { item: 'Medicine blister pack', why: 'Drug residue should not reach larvae feed' },
    ],
  },
  other_hazards: [],
  actions: [
    'Set this load aside without sorting it by hand.',
    'Remove the syringe with tongs into a hard, lidded container.',
    'Remove plastic bags before the rest goes to the larvae.',
  ],
};

const ERRORS: Record<string, string> = {
  sign_in_required: 'Your session has ended. Sign in again to use the photo check.',
  daily_limit: 'You’ve reached today’s limit of photo checks. Try again tomorrow.',
  not_configured: 'The photo check isn’t switched on yet. An admin needs to finish setting it up.',
  image_too_large: 'That photo is too large. Try a smaller one.',
  no_image: 'We didn’t receive a photo. Try again.',
};

/** Shrink the photo before sending: faster on mobile data, and cheaper */
function compressImage(file: File): Promise<{ base64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      URL.revokeObjectURL(url);
      resolve({ base64: dataUrl.split(',')[1], preview: dataUrl });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
    img.src = url;
  });
}

export function PhotoCheck() {
  const { authMode } = useApp();
  const isReal = authMode === 'real';
  const [lang, setLang] = useState<Lang>('en');
  const [photo, setPhoto] = useState<{ base64: string; preview: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ data: CheckResult; lang: Lang; example?: boolean } | null>(null);
  const [history, setHistory] = useState<PastCheck[]>([]);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    if (!isReal) return;
    const { data } = await supabase
      .from('waste_checks')
      .select('id, created_at, verdict, medical_flag, organic_percent, language, result')
      .order('created_at', { ascending: false })
      .limit(8);
    if (data) setHistory(data as PastCheck[]);
  };
  useEffect(() => { loadHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [isReal]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setResult(null);
    try { setPhoto(await compressImage(file)); }
    catch { setError('We couldn’t open that photo. Try a different one.'); }
  };

  const runCheck = async () => {
    if (!photo) return;
    setChecking(true);
    setError('');
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('photo-check', {
        body: { image: photo.base64, mediaType: 'image/jpeg', language: lang },
      });
      if (fnError) {
        let code = '';
        try { code = (await (fnError as { context?: Response }).context?.json())?.error ?? ''; } catch { /* no body */ }
        setError(ERRORS[code] ?? 'The AI couldn’t check this photo right now. Try again in a moment.');
        return;
      }
      setResult({ data: data.result as CheckResult, lang });
      loadHistory();
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('We couldn’t reach the server. Check your connection and try again.');
    } finally {
      setChecking(false);
    }
  };

  const showExample = () => {
    setError('');
    setResult({ data: EXAMPLE, lang: 'en', example: true });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="space-y-8 max-w-[720px]">
      <header className="pt-2">
        <h1 className="text-[34px] leading-[41px] font-bold tracking-[-0.02em]" style={{ color: C.label }}>Photo check</h1>
        <p className="text-[15px] mt-1 max-w-[560px]" style={{ color: C.secondary }}>
          Photograph a waste load. AI checks whether it’s ready for the larvae, what to remove, and whether there’s medical waste.
        </p>
      </header>

      {!isReal && (
        <div className="bg-white rounded-2xl p-5 flex items-start gap-3">
          <Sparkles size={20} className="mt-0.5 flex-shrink-0" style={{ color: C.tint }} />
          <div className="text-[15px]" style={{ color: C.secondary }}>
            Photo checks use AI and need a Kijani Hub account.{' '}
            <Link to="/signup" style={{ color: C.tint }}>Create one</Link>, or{' '}
            <button type="button" onClick={showExample} style={{ color: C.tint }}>see an example result</button>.
          </div>
        </div>
      )}

      {isReal && (
        <section className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px]" style={{ color: C.secondary }}>Results in</p>
            <div role="radiogroup" aria-label="Result language" className="inline-flex p-0.5 rounded-[9px]" style={{ background: 'rgba(118,118,128,0.12)' }}>
              {([['en', 'English'], ['sw', 'Kiswahili']] as const).map(([id, label]) => (
                <button key={id} type="button" role="radio" aria-checked={lang === id} onClick={() => setLang(id)}
                  className="px-3 py-1 text-[13px] font-medium rounded-[7px] transition-colors"
                  style={lang === id ? { background: '#fff', color: C.label, boxShadow: '0 3px 8px rgba(0,0,0,0.12)' } : { color: C.label }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Capture */}
          <div className="bg-white rounded-2xl overflow-hidden">
            {photo ? (
              <img src={photo.preview} alt="The waste photo to check" className="w-full max-h-[420px] object-contain bg-black" />
            ) : (
              <button type="button" onClick={() => cameraRef.current?.click()}
                className="w-full h-[220px] flex flex-col items-center justify-center gap-3 border-b" style={{ borderColor: C.separator }}>
                <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(30,138,90,0.12)' }}>
                  <Camera size={28} style={{ color: C.tint }} />
                </span>
                <span className="text-[17px] font-medium" style={{ color: C.tint }}>Take a photo</span>
                <span className="text-[13px]" style={{ color: C.tertiary }}>Fill the frame with the waste, in good light</span>
              </button>
            )}
            <div className="pl-4 divide-y divide-[#E5E5EA]">
              {photo ? (
                <button type="button" onClick={() => { setPhoto(null); setResult(null); setError(''); }}
                  className="w-full h-11 pr-4 flex items-center gap-2 text-[17px]" style={{ color: C.tint }}>
                  <RotateCcw size={18} /> Use a different photo
                </button>
              ) : (
                <button type="button" onClick={() => libraryRef.current?.click()}
                  className="w-full h-11 pr-4 flex items-center gap-2 text-[17px]" style={{ color: C.tint }}>
                  <ImagePlus size={18} /> Choose from your photos
                </button>
              )}
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="sr-only" aria-label="Take a photo" />
            <input ref={libraryRef} type="file" accept="image/*" onChange={onFile} className="sr-only" aria-label="Choose a photo" />
          </div>

          {error && (
            <p role="alert" className="px-1 flex items-start gap-1.5 text-[15px]" style={{ color: C.red }}>
              <AlertTriangle size={17} className="mt-[2px] flex-shrink-0" /> {error}
            </p>
          )}

          <button type="button" onClick={runCheck} disabled={!photo || checking}
            className="w-full h-12 rounded-xl text-[17px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: C.tint }}>
            {checking ? 'Checking your photo…' : 'Check this waste'}
          </button>
          {checking && <p className="text-center text-[13px]" style={{ color: C.tertiary }}>This usually takes a few seconds.</p>}
          {!photo && (
            <p className="text-center text-[13px]">
              <button type="button" onClick={showExample} style={{ color: C.tint }}>See an example result</button>
            </p>
          )}
        </section>
      )}

      {/* Result */}
      <div ref={resultRef} aria-live="polite" className="scroll-mt-20">
        {result && <ResultView r={result.data} lang={result.lang} example={result.example} />}
      </div>

      {/* History */}
      {isReal && history.length > 0 && (
        <section aria-labelledby="history-title">
          <h2 id="history-title" className="text-[20px] font-semibold mb-2.5 px-1" style={{ color: C.label }}>Your recent checks</h2>
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="pl-4 divide-y divide-[#E5E5EA]">
              {history.map((h) => (
                <button key={h.id} type="button"
                  onClick={() => { setResult({ data: h.result, lang: h.language }); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50); }}
                  className="w-full flex items-center gap-3 pr-3 py-2.5 text-left hover:bg-black/[0.02]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: h.verdict === 'ready' ? '#34C759' : h.verdict === 'sort_first' ? '#FF9500' : '#FF3B30' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px]" style={{ color: C.label }}>
                      {T.en.verdict[h.verdict]}
                      {h.medical_flag !== 'no' && <span style={{ color: C.red }}> · medical waste {h.medical_flag === 'possible' ? 'possible' : 'found'}</span>}
                    </p>
                    <p className="text-[13px]" style={{ color: C.secondary }}>
                      {new Date(h.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · {h.organic_percent}% organic
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: '#C4C4C7' }} />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ResultView({ r, lang, example }: { r: CheckResult; lang: Lang; example?: boolean }) {
  const t = T[lang];
  const medical = r.medical_waste?.detected ?? 'no';
  const verdictColor = r.verdict === 'ready' ? C.green : r.verdict === 'sort_first' ? C.orange : C.red;
  const VerdictIcon = r.verdict === 'ready' ? CheckCircle2 : AlertTriangle;

  return (
    <section className="space-y-4" aria-label="Photo check result">
      {example && <p className="px-1 text-[13px]" style={{ color: C.tertiary }}>Example result, for demonstration.</p>}

      {/* Medical waste comes first, always */}
      {medical !== 'no' && (
        <div className="rounded-2xl p-5" style={{ background: medical === 'yes' ? '#FFEBEA' : '#FFF4E5' }} role="alert">
          <p className="flex items-center gap-2 text-[19px] font-semibold" style={{ color: medical === 'yes' ? C.red : C.orange }}>
            <ShieldAlert size={22} /> {medical === 'yes' ? t.medicalYes : t.medicalPossible}
          </p>
          <p className="mt-1 text-[15px]" style={{ color: C.label }}>{t.medicalLead}</p>
          {r.medical_waste.items.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {r.medical_waste.items.map((m, i) => (
                <li key={i} className="text-[15px]" style={{ color: C.label }}>
                  <span className="font-semibold">{m.item}</span> <span style={{ color: C.secondary }}>— {m.why}</span>
                </li>
              ))}
            </ul>
          )}
          <ol className="mt-4 space-y-1.5 list-decimal pl-5 text-[15px]" style={{ color: C.label }}>
            {t.safety.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </div>
      )}

      {/* Verdict */}
      <div className="bg-white rounded-2xl p-5">
        <p className="flex items-center gap-2 text-[22px] font-semibold tracking-[-0.01em]" style={{ color: verdictColor }}>
          <VerdictIcon size={24} /> {t.verdict[r.verdict]}
        </p>
        <p className="mt-2 text-[17px] leading-[1.45]" style={{ color: C.label }}>{r.summary}</p>
        {r.image_quality === 'poor' && <p className="mt-2 text-[15px]" style={{ color: C.orange }}>{t.poor}</p>}

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px]" style={{ color: C.secondary }}>{t.organic}</p>
            <p className="text-[22px] font-semibold tabular-nums" style={{ color: C.label }}>{r.organic_percent}%</p>
          </div>
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: C.fill }}>
            <div className="h-full rounded-full" style={{ width: `${r.organic_percent}%`, background: C.tint }} />
          </div>
        </div>
      </div>

      {r.contaminants.length > 0 && (
        <Group title={t.remove}>
          {r.contaminants.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-3 pr-4 py-2.5">
              <span className="text-[17px]" style={{ color: C.label }}>{c.item}</span>
              <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: c.severity === 'high' ? C.red : c.severity === 'medium' ? C.orange : C.tertiary }}>
                {t.severity[c.severity]}
              </span>
            </div>
          ))}
        </Group>
      )}

      {r.other_hazards.length > 0 && (
        <Group title={t.hazards}>
          {r.other_hazards.map((h, i) => (
            <div key={i} className="pr-4 py-2.5">
              <p className="text-[17px]" style={{ color: C.label }}>{h.item}</p>
              <p className="text-[13px]" style={{ color: C.secondary }}>{h.why}</p>
            </div>
          ))}
        </Group>
      )}

      {r.actions.length > 0 && (
        <Group title={t.todo}>
          {r.actions.slice(0, 4).map((a, i) => (
            <div key={i} className="flex items-start gap-3 pr-4 py-2.5">
              <span className="mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-semibold text-white" style={{ background: C.tint }}>{i + 1}</span>
              <p className="text-[17px] leading-[1.4]" style={{ color: C.label }}>{a}</p>
            </div>
          ))}
        </Group>
      )}

      <p className="px-1 text-[13px]" style={{ color: C.tertiary }}>{t.disclaimer}</p>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 mb-1.5 text-[13px]" style={{ color: C.secondary }}>{title}</p>
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="pl-4 divide-y divide-[#E5E5EA]">{children}</div>
      </div>
    </div>
  );
}
