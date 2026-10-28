import { useEffect, useState } from 'react'
import { PREVIEW_SIZE } from '@/lib/config'
import {
  blobToDataUrl,
  decodeQrBlob,
  QrGenerationError,
  renderQrBlob,
} from '@/lib/qr/engine'
import { analyzeScannability, emptyScannability } from '@/lib/validation/scannability'
import type { ScannabilityResult, StyleConfig } from '@/lib/types'

export interface QrPreviewState {
  previewUrl: string | null
  validation: ScannabilityResult
  error: 'capacity' | 'generation' | null
  checking: boolean
  hasRender: boolean
}

const initialState: QrPreviewState = {
  previewUrl: null,
  validation: emptyScannability(),
  error: null,
  checking: false,
  hasRender: false,
}

/**
 * Renders the live preview and, separately, decodes the exact bitmap that would
 * be exported at the selected size. Everything is cancelled on every keystroke
 * so a stale render can never overwrite a newer one.
 */
export function useQrPreview(
  payload: string | null,
  style: StyleConfig,
): QrPreviewState {
  const [state, setState] = useState<QrPreviewState>(initialState)

  useEffect(() => {
    if (!payload) return

    let cancelled = false
    const timer = window.setTimeout(() => {
      setState((previous) => ({
        ...previous,
        checking: true,
        error: null,
        validation: previous.hasRender
          ? { ...previous.validation, status: 'checking' }
          : emptyScannability(),
      }))
      void (async () => {
        try {
          const previewBlob = await renderQrBlob({
            payload,
            style,
            size: PREVIEW_SIZE,
            transparentBackground: style.transparentBackground,
          })
          if (cancelled) return

          const verifyBlob =
            style.size === PREVIEW_SIZE
              ? previewBlob
              : await renderQrBlob({
                  payload,
                  style,
                  size: style.size,
                  transparentBackground: style.transparentBackground,
                })
          const decode = await decodeQrBlob(verifyBlob)
          if (cancelled) return

          const validation = analyzeScannability({
            style,
            expected: payload,
            decoded: decode.data,
            durationMs: decode.durationMs,
            decodeFailed: decode.data === null,
          })
          const previewUrl = await blobToDataUrl(previewBlob)
          if (cancelled) return

          setState({
            previewUrl,
            validation,
            error: null,
            checking: false,
            hasRender: true,
          })
        } catch (error) {
          if (cancelled) return
          const code =
            error instanceof QrGenerationError && error.code === 'capacity'
              ? 'capacity'
              : 'generation'
          setState((previous) => ({
            ...previous,
            checking: false,
            error: code,
            validation: {
              ...emptyScannability(),
              status: 'unscannable',
              message: 'decode_failed',
            },
          }))
        }
      })()
    }, 220)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [payload, style])

  return payload ? state : initialState
}
