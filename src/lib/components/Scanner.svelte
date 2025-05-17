<script
  lang='ts'
  module>
  import type { QuaggaJSCodeReader, QuaggaJSResultObject } from '@ericblade/quagga2'
  import Quagga from '@ericblade/quagga2'
  import QrCodeReader from 'quagga2-reader-qr'

  const READER = 'qrcode' as QuaggaJSCodeReader

  Quagga.registerReader(READER, QrCodeReader)
</script>

<script lang='ts'>
  interface Props {
    preview: HTMLElement
    onCode: (code: string) => void
  }

  const { preview, onCode }: Props = $props()

  function onDetected(data: QuaggaJSResultObject) {
    if (data.codeResult.code !== null) {
      onCode(data.codeResult.code)
    }
  }

  $effect(() => {
    void Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: preview,
          constraints: {
            facingMode: 'environment',
          },
        },
        frequency: 5,
        decoder: {
          readers: [READER],
        },
      },
      () => {
        Quagga.onDetected(onDetected)
        Quagga.start()
      },
    )

    return () => {
      Quagga.offDetected(onDetected)
      void Quagga.pause()
    }
  })
</script>
