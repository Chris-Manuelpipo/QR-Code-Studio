import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { getFormSchema } from '@/lib/schemas/forms'
import { useStudioStore } from '@/store/studio'
import type { ContentType, FormDataMap } from '@/lib/types'

export function useContentForm<K extends ContentType>(type: K) {
  const stored = useStudioStore((state) => state.forms[type])
  const setFormValues = useStudioStore((state) => state.setFormValues)

  const form = useForm<FormDataMap[K]>({
    defaultValues: stored as never,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(getFormSchema(type)) as unknown as Resolver<FormDataMap[K]>,
  })

  const { watch } = form

  useEffect(() => {
    const subscription = watch((values) => {
      setFormValues(type, values as FormDataMap[K])
    })
    return () => subscription.unsubscribe()
  }, [watch, type, setFormValues])

  return form
}
