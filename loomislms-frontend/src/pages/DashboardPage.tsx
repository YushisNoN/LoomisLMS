import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function DashboardPage() {
    const { user, logout } = useAuth()

    return (
        <div className="min-h-screen bg-app p-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text">
                            LoomisLMS
                        </h1>
                        <p className="mt-2 text-text-secondary">
                            Добро пожаловать, {user?.name}!
                        </p>
                    </div>

                    <Button variant="secondary" onClick={logout}>
                        Выйти
                    </Button>
                </header>
                <div className="grid gap-5 md:grid-cols-3">
                    <Card>
                        <h2 className="text-text-secondary">
                            Мои курсы
                        </h2>
                        <p className="mt-3 text-3xl font-bold">
                            0
                        </p>
                    </Card>
                    <Card>
                        <h2 className="text-text-secondary">
                            Активные задания
                        </h2>
                        <p className="mt-3 text-3xl font-bold">
                            0
                        </p>
                    </Card>
                    <Card>
                        <h2 className="text-text-secondary">
                            Завершённые курсы
                        </h2>
                        <p className="mt-3 text-3xl font-bold">
                            0
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage