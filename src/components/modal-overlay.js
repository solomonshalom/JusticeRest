/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react'
import { Overlay, OverlayProps } from '@radix-ui/react-dialog'
import { FC } from 'react'

const fadeIn = keyframes`
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
`

interface ModalOverlayProps extends OverlayProps {}

const ModalOverlay: FC<ModalOverlayProps> = (props) => (
  <Overlay
    css={css`
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(0.5rem);
      position: fixed;
      inset: 0;
      animation: ${fadeIn} 100ms ease-out;
    `}
    {...props}
  />
)

export default ModalOverlay
