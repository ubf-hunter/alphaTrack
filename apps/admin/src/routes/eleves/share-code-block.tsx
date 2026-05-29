import { useState } from 'react';
import { Button, Icon } from '@alphatrack/ui';

interface Props {
  matricule: string;
  prenom: string;
  nom: string;
  code: string;
  /** Numéro tel format +237xxx ou xxx — sera normalisé */
  telephone?: string | null | undefined;
  /** URL du portail élève (par défaut : eleves.alphacenter.cm). */
  portalUrl?: string;
}

/**
 * Bloc d'affichage du code d'accès avec actions de partage sécurisées :
 * - Affichage en gros monospace (lecture humaine)
 * - Bouton Copier (presse-papier)
 * - Bouton WhatsApp (lien wa.me si numéro disponible)
 * - Bouton SMS (lien sms: si numéro disponible — natif mobile)
 *
 * Le code reste local au composant — jamais ré-affiché après fermeture du modal.
 */
export function ShareCodeBlock({
  matricule,
  prenom,
  nom,
  code,
  telephone,
  portalUrl = 'https://eleves.alphacenter.cm',
}: Props): JSX.Element {
  const [copied, setCopied] = useState(false);

  const phoneNormalized = normalizePhone(telephone);

  const message = buildMessage({ prenom, matricule, code, portalUrl });
  const waUrl = phoneNormalized
    ? `https://wa.me/${phoneNormalized}?text=${encodeURIComponent(message)}`
    : null;
  const smsUrl = phoneNormalized
    ? `sms:+${phoneNormalized}?body=${encodeURIComponent(message)}`
    : null;

  async function handleCopy(): Promise<void> {
    const text = `Matricule : ${matricule}\nCode : ${code}\nPortail : ${portalUrl}`;
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — l'utilisateur peut copier à la main
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Bloc code en gros + matricule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-surface-base border border-surface-border">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Matricule
          </p>
          <p className="font-mono font-bold text-lg text-slate-900 tabular tracking-wider">
            {matricule}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-lime-50 border border-lime-300">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Code d&apos;accès
          </p>
          <p className="font-mono font-bold text-lg text-slate-900 tabular tracking-[0.18em]">
            {code}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => void handleCopy()}>
          <Icon name={copied ? 'circle-check' : 'check'} />
          {copied ? 'Copié' : 'Copier'}
        </Button>

        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-8 px-3 text-xs rounded-md font-semibold tracking-tight bg-[#25D366] text-white hover:bg-[#1ebe5b] active:bg-[#179e4d] focus-visible:ring-4 focus-visible:ring-[#25D366]/30 outline-none transition-colors"
          >
            <WhatsAppIcon />
            Envoyer par WhatsApp
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-slate-400 italic">
            <Icon name="lock" className="w-3 h-3" />
            Ajoute un téléphone pour partager via WhatsApp
          </span>
        )}

        {smsUrl && (
          <a
            href={smsUrl}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs rounded-md font-semibold tracking-tight bg-surface-base text-slate-700 border border-surface-border hover:bg-surface-muted hover:border-slate-300 outline-none transition-colors"
          >
            <Icon name="bell" />
            SMS
          </a>
        )}
      </div>

      {/* Aperçu du message (transparence) */}
      {phoneNormalized && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer hover:text-slate-700 font-medium">
            Aperçu du message à envoyer
          </summary>
          <pre className="mt-2 p-3 rounded-xl bg-slate-50 border border-surface-border text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
            {message}
          </pre>
          <p className="mt-1.5">
            Destinataire : <span className="font-mono">+{phoneNormalized}</span> ({prenom} {nom})
          </p>
        </details>
      )}
    </div>
  );
}

/** Normalise un numéro pour wa.me / sms: (digits only, sans +). */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

function buildMessage(args: {
  prenom: string;
  matricule: string;
  code: string;
  portalUrl: string;
}): string {
  return (
    `Bonjour ${args.prenom},\n\n` +
    `Voici tes identifiants pour le portail des résultats Alpha Center :\n\n` +
    `Matricule : ${args.matricule}\n` +
    `Code d'accès : ${args.code}\n\n` +
    `Portail : ${args.portalUrl}\n\n` +
    `Garde ce code secret — il te permet d'accéder à tes résultats. Ne le partage avec personne.`
  );
}

function WhatsAppIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
