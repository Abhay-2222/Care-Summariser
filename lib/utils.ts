import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-title',
        'text-name',
        'text-patient-name',
        'text-body',
        'text-body-sm',
        'text-body-md',
        'text-body-lg',
        'text-meta',
        'text-label-sm',
        'text-label-md',
        'text-caption',
        'text-overline',
        'text-ds-badge',
        'text-heading-sm',
        'text-heading-md',
        'text-heading-lg',
        'text-display-xl',
        'text-display-2xl',
        'text-clinical-val',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
