import { TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'

export function VCardForm() {
  const { t, te } = useI18n()
  const {
    register,
    formState: { errors },
  } = useContentForm('vcard')
  const optional = t('hint.optional')

  return (
    <div className="form-stack">
      <div className="form-row">
        <TextField
          id="lastName"
          label={t('field.lastName')}
          placeholder={t('placeholder.lastName')}
          error={te(errors.lastName?.message)}
          required
          requiredLabel={t('hint.required')}
          autoComplete="family-name"
          {...register('lastName')}
        />
        <TextField
          id="firstName"
          label={t('field.firstName')}
          placeholder={t('placeholder.firstName')}
          error={te(errors.firstName?.message)}
          optional={optional}
          autoComplete="given-name"
          {...register('firstName')}
        />
      </div>

      <p className="form-note">{t('hint.vcard')}</p>

      <div className="form-row">
        <TextField
          id="phone"
          label={t('field.phone')}
          placeholder={t('placeholder.phone')}
          error={te(errors.phone?.message)}
          optional={optional}
          type="tel"
          autoComplete="tel"
          {...register('phone')}
        />
        <TextField
          id="email"
          label={t('field.email')}
          placeholder={t('placeholder.email')}
          error={te(errors.email?.message)}
          optional={optional}
          type="email"
          autoComplete="email"
          {...register('email')}
        />
      </div>

      <div className="form-row">
        <TextField
          id="org"
          label={t('field.org')}
          placeholder={t('placeholder.org')}
          error={te(errors.org?.message)}
          optional={optional}
          autoComplete="organization"
          {...register('org')}
        />
        <TextField
          id="title"
          label={t('field.title')}
          placeholder={t('placeholder.title')}
          error={te(errors.title?.message)}
          optional={optional}
          autoComplete="organization-title"
          {...register('title')}
        />
      </div>

      <TextField
        id="vcard-url"
        label={t('field.website')}
        placeholder={t('placeholder.website')}
        error={te(errors.url?.message)}
        optional={optional}
        type="url"
        inputMode="url"
        {...register('url')}
      />

      <TextField
        id="address"
        label={t('field.address')}
        placeholder={t('placeholder.address')}
        error={te(errors.address?.message)}
        optional={optional}
        autoComplete="street-address"
        {...register('address')}
      />
    </div>
  )
}
