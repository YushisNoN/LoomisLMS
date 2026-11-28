interface HeaderProps {
    title: string
    subtitle?: string
}

function Header({ title, subtitle }: HeaderProps) {
    return (
        <header className="
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-border
            bg-sidebar
            px-8
        ">
            <div>
                <h2 className="text-lg font-semibold">
                    {title}
                </h2>

                {subtitle && (
                    <p className="text-xs text-text-muted">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <button className="
                    rounded-lg
                    p-2
                    text-text-secondary
                    hover:bg-surface-hover
                ">
                    Уведомления
                </button>

                <div className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-muted
                    text-sm
                    font-semibold
                    text-primary
                ">
                    U
                </div>
            </div>
        </header>
    )
}

export default Header