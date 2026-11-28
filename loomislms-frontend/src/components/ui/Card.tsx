import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

function Card({children, className = '', ...props}: CardProps) {
    return (
        <div
            className={`
                rounded-xl
                border
                border-border
                bg-surface
                p-5
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    )
}

export default Card