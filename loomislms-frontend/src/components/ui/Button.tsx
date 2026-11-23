import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'border border-border bg-surface text-text hover:bg-surface-hover',
    danger: 'bg-danger text-white hover:brightness-110',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text',
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',

    md: 'px-5 py-2.5 text-sm',

    lg: 'px-6 py-3 text-base',
}

function Button({
                    variant = 'primary',
                    size = 'md',
                    className = '',
                    children,
                    type = 'button',
                    disabled,
                    ...props
                }: ButtonProps) {

    const baseStyles = `
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        font-medium
        transition-colors
        duration-200
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
        focus-visible:ring-offset-app
        disabled:cursor-not-allowed
        disabled:opacity-50
    `

    return (
        <button
            type={type}
            disabled={disabled}
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
