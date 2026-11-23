function Sidebar() {
    return (
        <aside className="
            flex
            h-screen
            w-60
            flex-col
            border-r
            border-border
            bg-sidebar
            p-5
        ">
            <div className="mb-10">
                <h1 className="text-xl font-bold">
                    Loomis<span className="text-primary">LMS</span>
                </h1>

                <p className="mt-1 text-xs text-text-muted">
                    Learning Management System
                </p>
            </div>

            <nav className="flex flex-col gap-2">
                <button className="rounded-lg bg-primary-muted px-4 py-3 text-left text-sm text-primary">
                    Dashboard
                </button>

                <button className="rounded-lg px-4 py-3 text-left text-sm text-text-secondary hover:bg-surface-hover">
                    Мои курсы
                </button>

                <button className="rounded-lg px-4 py-3 text-left text-sm text-text-secondary hover:bg-surface-hover">
                    Задания
                </button>

                <button className="rounded-lg px-4 py-3 text-left text-sm text-text-secondary hover:bg-surface-hover">
                    Профиль
                </button>
            </nav>

            <div className="mt-auto border-t border-border pt-4">
                <p className="text-xs text-text-muted">
                    LoomisLMS © 2026
                </p>
            </div>
        </aside>
    )
}

export default Sidebar