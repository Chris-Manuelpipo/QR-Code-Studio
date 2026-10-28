import { Segmented, TextAreaField, TextField } from '@/components/forms/fields'
import { useContentForm } from '@/components/forms/useContentForm'
import { useI18n } from '@/hooks/useI18n'
import { EnvelopeSimple, Phone } from '@phosphor-icons/react'

export function ContactForm() {
  const { t, te } = useI18n()
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useContentForm('contact')
  const channel = watch('channel')

  return (
    <div className="form-stack">
      <div className="field">
        <div className="field-head">
          <span className="field-label">{t('field.channel')}</span>
        </div>
        <Segmented
          name="channel"
          label={t('field.channel')}
          value={channel}
          onChange={(value) =>
            setValue('channel', value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          options={[
            {
              value: 'email',
              label: t('channel.email'),
              icon: <EnvelopeSimple size={16} />,
            },
            {
              value: 'phone',
              label: t('channel.phone'),
              icon: <Phone size={16} />,
            },
            {
              value: 'sms',
              label: t('channel.sms'),
              icon: <span className="segment-text-icon">SMS</span>,
            },
          ]}
        />
        <p className="field-hint">
          {channel === 'email'
            ? t('hint.contactEmail')
            : channel === 'phone'
              ? t('hint.contactPhone')
              : t('hint.contactSms')}
        </p>
      </div>

      {channel === 'email' ? (
        <>
          <TextField
            id="contact-email"
            label={t('field.email')}
            placeholder={t('placeholder.email')}
            error={te(errors.email?.message)}
            required
            requiredLabel={t('hint.required')}
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          <TextField
            id="contact-subject"
            label={t('field.subject')}
            placeholder={t('placeholder.subject')}
            error={te(errors.subject?.message)}
            optional={t('hint.optional')}
            {...register('subject')}
          />
          <TextAreaField
            id="contact-body"
            label={t('field.body')}
            placeholder={t('placeholder.body')}
            error={te(errors.body?.message)}
            optional={t('hint.optional')}
            rows={4}
            {...register('body')}
          />
        </>
      ) : (
        <>
          <TextField
            id="contact-phone"
            label={t('field.phone')}
            placeholder={t('placeholder.phone')}
            error={te(errors.phone?.message)}
            required
            requiredLabel={t('hint.required')}
            type="tel"
            autoComplete="tel"
            {...register('phone')}
          />
          {channel === 'sms' ? (
            <TextAreaField
              id="contact-message"
              label={t('field.smsMessage')}
              placeholder={t('placeholder.smsMessage')}
              error={te(errors.message?.message)}
              optional={t('hint.optional')}
              rows={3}
              {...register('message')}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
