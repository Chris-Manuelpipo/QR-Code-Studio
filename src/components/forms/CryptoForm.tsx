import { SelectField, TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'
import { CRYPTO_SCHEMES } from '@/lib/types'

export function CryptoForm() {
  const { t, te } = useI18n()
  const {
    register,
    formState: { errors },
  } = useContentForm('crypto')

  return (
    <div className="form-stack">
      <div className="form-row">
        <SelectField
          id="scheme"
          label={t('field.scheme')}
          error={te(errors.scheme?.message)}
          {...register('scheme')}
        >
          {CRYPTO_SCHEMES.map((scheme) => (
            <option key={scheme} value={scheme}>
              {t(`scheme.${scheme}`)}
            </option>
          ))}
        </SelectField>
        <TextField
          id="crypto-amount"
          label={t('field.amount')}
          placeholder={t('placeholder.amount')}
          hint={t('hint.crypto')}
          error={te(errors.amount?.message)}
          optional={t('hint.optional')}
          inputMode="decimal"
          mono
          {...register('amount')}
        />
      </div>

      <TextField
        id="crypto-address"
        label={t('field.cryptoAddress')}
        placeholder={t('placeholder.cryptoAddress')}
        error={te(errors.address?.message)}
        required
        requiredLabel={t('hint.required')}
        autoComplete="off"
        spellCheck={false}
        mono
        {...register('address')}
      />

      <TextField
        id="crypto-label"
        label={t('field.label')}
        placeholder={t('placeholder.label')}
        error={te(errors.label?.message)}
        optional={t('hint.optional')}
        {...register('label')}
      />
    </div>
  )
}
