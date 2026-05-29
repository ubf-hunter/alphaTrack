import { Button, Modal } from '@alphatrack/ui';
import type { EleveListItem } from '../../hooks/useEleves';

interface Props {
  open: boolean;
  onClose: () => void;
  eleve: EleveListItem;
  isPending: boolean;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteModal({
  open,
  onClose,
  eleve,
  isPending,
  onConfirm,
}: Props): JSX.Element {
  const inscCount = eleve.inscriptions.length;

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={`Supprimer ${eleve.prenom} ${eleve.nom} ?`}
      description="Cette action est irréversible. Toutes les inscriptions et notes associées seront supprimées."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            loading={isPending}
            onClick={() => void onConfirm()}
          >
            Supprimer définitivement
          </Button>
        </>
      }
    >
      <div className="text-sm text-slate-600 space-y-3">
        <p>Tu vas supprimer définitivement :</p>
        <div className="p-3 rounded-xl bg-surface-muted border border-surface-border">
          <p className="font-mono font-semibold text-slate-900">{eleve.matricule}</p>
          <p className="text-slate-700">
            {eleve.prenom} {eleve.nom}
          </p>
          {inscCount > 0 && (
            <p className="text-xs text-danger mt-2">
              {inscCount} inscription{inscCount > 1 ? 's' : ''} active{inscCount > 1 ? 's' : ''}{' '}
              sera{inscCount > 1 ? 'ont' : ''} également supprimée{inscCount > 1 ? 's' : ''}.
            </p>
          )}
        </div>
        <p className="text-xs text-slate-500">
          Cette opération peut être bloquée par la contrainte FK si des notes existent
          déjà sur des évaluations publiées.
        </p>
      </div>
    </Modal>
  );
}
