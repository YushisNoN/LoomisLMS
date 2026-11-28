import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

function Input({
                   label,
                   error,
                   className = '',
                   id,
                   ...props
               }: InputProps) {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-text-secondary"
                >
                    {label}
                </label>
            )}

            <input
                id={inputId}
                className={`
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-app
                    px-4
                    py-2.5
                    text-sm
                    text-text
                    outline-none
                    transition-colors
                    placeholder:text-text-muted
                    focus:border-primary
                    focus:ring-1
                    focus:ring-primary
                    ${error ? 'border-danger' : ''}
                    ${className}
                `}
                aria-invalid={Boolean(error)}
                {...props}
            />

            {error && (
                <span className="text-xs text-danger">
                    {error}
                </span>
            )}
        </div>
    )
}

export default Input