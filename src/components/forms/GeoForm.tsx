import { TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'

export function GeoForm() {
  const { t, te } = useI18n()
  const {
    register,
    formState: { errors },
  } = useContentForm('geo')

  return (
    <div className="form-stack">
      <div className="form-row">
        <TextField
          id="lat"
          label={t('field.lat')}
          placeholder={t('placeholder.lat')}
          hint={t('hint.geo')}
          error={te(errors.lat?.message)}
          required
          requiredLabel={t('hint.required')}
          inputMode="decimal"
          mono
          {...register('lat')}
        />
        <TextField
          id="lng"
          label={t('field.lng')}
          placeholder={t('placeholder.lng')}
          error={te(errors.lng?.message)}
          required
          requiredLabel={t('hint.required')}
          inputMode="decimal"
          mono
          {...register('lng')}
        />
      </div>

      <TextField
        id="geo-label"
        label={t('field.geoLabel')}
        placeholder={t('placeholder.geoLabel')}
        error={te(errors.label?.message)}
        optional={t('hint.optional')}
        {...register('label')}
      />
    </div>
  )
}
