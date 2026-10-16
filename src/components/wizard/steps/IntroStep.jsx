import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { starterSentence } from '../../../lib/pageDraft.js';
import { AppField } from '../../app/forms.jsx';
import Icon from '../../ui/Icon.jsx';
import WikitextEditor from '../WikitextEditor.jsx';
import { useFieldErrors } from '../fieldError.js';

export default function IntroStep() {
  const { control, setValue } = useFormContext();
  const err = useFieldErrors();
  const [lead, title, shortDescription, birthDate, deathDate] = useWatch({
    control,
    name: ['lead', 'title', 'shortDescription', 'infobox.birthDate', 'infobox.deathDate'],
  });

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-app-border bg-app-gold-soft/60 px-4 py-3 text-sm text-app-ink-soft">
        <p className="m-0">
          <b>Tip:</b> encyclopedia articles start with the person’s name in <b>bold</b>, their dates, and one
          sentence on why they are notable. Then a short paragraph or two summarising their life.
        </p>
        {!lead?.trim() && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 font-semibold text-app-accent hover:underline"
            onClick={() => setValue('lead', starterSentence({ title, shortDescription, birthDate, deathDate }), { shouldDirty: true })}
          >
            <Icon name="sparkle" size={13} /> Start with a first sentence for me
          </button>
        )}
      </div>
      <AppField label="Introduction" hint="Leave an empty line between paragraphs. Start a line with “* ” for a bullet list." error={err('lead')}>
        {(p) => (
          <Controller
            control={control}
            name="lead"
            render={({ field }) => (
              <WikitextEditor {...field} {...p} rows={12} placeholder="'''Ram Singh''' (born 21 August 1987) is an Indian civil engineer…" />
            )}
          />
        )}
      </AppField>
    </div>
  );
}
