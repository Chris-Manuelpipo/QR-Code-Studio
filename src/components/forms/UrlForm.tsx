import { TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'

export function UrlForm() {
  const { t, te } = useI18n()
  const {
    register,
    formState: { errors },
  } = useContentForm('url')

  return (
    <div className="form-stack">
      <TextField
        id="url"
        label={t('field.url')}
        placeholder={t('placeholder.url')}
        hint={t('hint.url')}
        error={te(errors.url?.message)}
        required
        requiredLabel={t('hint.required')}
        type="url"
        inputMode="url"
        autoComplete="url"
        spellCheck={false}
        {...register('url')}
      />
    </div>
  )
}
