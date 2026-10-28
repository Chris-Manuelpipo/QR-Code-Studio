import { TextAreaField, TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'

export function VEventForm() {
  const { t, te } = useI18n()
  const {
    register,
    formState: { errors },
  } = useContentForm('vevent')

  return (
    <div className="form-stack">
      <TextField
        id="event-title"
        label={t('field.eventTitle')}
        placeholder={t('placeholder.eventTitle')}
        error={te(errors.title?.message)}
        required
        requiredLabel={t('hint.required')}
        {...register('title')}
      />

      <div className="form-row">
        <TextField
          id="start"
          label={t('field.start')}
          hint={t('hint.vevent')}
          error={te(errors.start?.message)}
          required
          type="datetime-local"
          {...register('start')}
        />
        <TextField
          id="end"
          label={t('field.end')}
          error={te(errors.end?.message)}
          optional={t('hint.optional')}
          type="datetime-local"
          {...register('end')}
        />
      </div>

      <TextField
        id="location"
        label={t('field.location')}
        placeholder={t('placeholder.location')}
        error={te(errors.location?.message)}
        optional={t('hint.optional')}
        {...register('location')}
      />

      <TextAreaField
        id="event-description"
        label={t('field.description')}
        placeholder={t('placeholder.description')}
        error={te(errors.description?.message)}
        optional={t('hint.optional')}
        rows={3}
        {...register('description')}
      />
    </div>
  )
}
