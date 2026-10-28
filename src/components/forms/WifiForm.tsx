import { CheckboxField, SelectField, TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'

export function WifiForm() {
  const { t, te } = useI18n()
  const {
    register,
    watch,
    formState: { errors },
  } = useContentForm('wifi')
  const encryption = watch('encryption')

  return (
    <div className="form-stack">
      <TextField
        id="ssid"
        label={t('field.ssid')}
        placeholder={t('placeholder.ssid')}
        error={te(errors.ssid?.message)}
        required
        requiredLabel={t('hint.required')}
        autoComplete="off"
        {...register('ssid')}
      />

      <div className="form-row">
        <SelectField
          id="encryption"
          label={t('field.encryption')}
          error={te(errors.encryption?.message)}
          {...register('encryption')}
        >
          <option value="WPA">{t('encryption.wpa')}</option>
          <option value="WEP">{t('encryption.wep')}</option>
          <option value="nopass">{t('encryption.nopass')}</option>
        </SelectField>

        {encryption !== 'nopass' ? (
          <TextField
            id="password"
            label={t('field.password')}
            placeholder={t('placeholder.password')}
            hint={t('hint.wifiPassword')}
            error={te(errors.password?.message)}
            required
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
        ) : null}
      </div>

      <CheckboxField
        id="hidden"
        label={t('field.hidden')}
        hint={t('hint.wifi')}
        {...register('hidden')}
      />
    </div>
  )
}
