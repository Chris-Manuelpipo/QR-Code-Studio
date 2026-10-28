import { TextAreaField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'
import { formatNumber } from '@/i18n'

export function TextForm() {
  const { t, te, locale } = useI18n()
  const {
    register,
    watch,
    formState: { errors },
  } = useContentForm('text')
  const value = watch('text') ?? ''

  return (
    <div className="form-stack">
      <TextAreaField
        id="text"
        label={t('field.text')}
        placeholder={t('placeholder.text')}
        hint={t('hint.text', { count: formatNumber(locale, value.length) })}
        error={te(errors.text?.message)}
        required
        requiredLabel={t('hint.required')}
        rows={7}
        maxLength={1000}
        {...register('text')}
      />
    </div>
  )
}
