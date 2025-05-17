<script
  lang='ts'
  module>
  import type { QuaggaJSCodeReader } from '@ericblade/quagga2'
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

  $effect(() => {
    void Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: preview,
        constraints: {
          facingMode: 'environment',
        },
      },
      decoder: {
        readers: [READER],
      },
    }).then(() => Quagga.start())

    Quagga.onDetected(data => data.codeResult.code !== null && onCode(data.codeResult.code))

    return () => void Quagga.stop()
  })
</script>
