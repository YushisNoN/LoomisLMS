import Sidebar from '../components/layouts/Sidebar.tsx'
import Header from '../components/layouts/Header.tsx'

function App() {
    return (
        <div className="flex h-screen overflow-hidden bg-app">

            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">

                <Header
                    title="Dashboard"
                    subtitle="Добро пожаловать в LoomisLMS"
                />

                <main className="flex-1 overflow-y-auto p-8">

                    <h1 className="mb-6 text-2xl font-bold">
                        Главная
                    </h1>

                    <div className="grid grid-cols-3 gap-5">

                        <div className="rounded-xl border border-border bg-surface p-5">
                            <p className="text-sm text-text-secondary">
                                Активные курсы
                            </p>

                            <p className="mt-3 text-3xl font-bold">
                                4
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-5">
                            <p className="text-sm text-text-secondary">
                                Выполненные задания
                            </p>

                            <p className="mt-3 text-3xl font-bold">
                                12
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-5">
                            <p className="text-sm text-text-secondary">
                                Ожидают проверки
                            </p>

                            <p className="mt-3 text-3xl font-bold">
                                3
                            </p>
                        </div>

                    </div>

                </main>
            </div>
        </div>
    )
}

export default App