import Button from '../components/ui/Button.tsx';
import Card from "../components/ui/Card.tsx";
import Input from "../components/ui/Input.tsx";

function App() {
    return (
        <main className="min-h-screen bg-app p-8 text-text">

            <header className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold">
                    L
                </div>
                <div>
                    <h1 className="text-xl font-bold">
                        LoomisLMS
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Learning Management System
                    </p>
                </div>
            </header>
            <section className="mx-auto max-w-4xl">
                <h2 className="mb-2 text-3xl font-bold">
                    Design System
                </h2>
                <p className="mb-8 text-text-secondary">
                    Welcome to LoomisLMS.
                    Your learning journey starts here.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <span className="text-sm text-text-secondary">
                            Primary Color
                        </span>
                        <div className="mt-4 h-12 rounded-lg bg-primary" />
                        <p className="mt-3 font-mono text-sm">
                            #7968F2
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-surface p-6">
                        <span className="text-sm text-text-secondary">
                            Success Color
                        </span>
                        <div className="mt-4 h-12 rounded-lg bg-success" />
                            <p className="mt-3 font-mono text-sm">
                                #32C997
                            </p>
                    </div>
                </div>
                <div className="mt-6 rounded-xl border border-border bg-surface p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Component Preview
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="rounded-lg bg-primary px-5 py-2.5 font-medium transition hover:bg-primary-hover">
                            Primary Button
                        </button>
                        <button className="rounded-lg border border-border px-5 py-2.5 transition hover:bg-surface-hover">
                            Secondary Button
                        </button>
                        <span className="rounded-full bg-success/15 px-3 py-1 text-sm text-success">
                          Completed
                        </span>
                        <span className="rounded-full bg-warning/15 px-3 py-1 text-sm text-warning">
                            Pending
                            </span>
                    </div>
                </div>
            <div className="mt-8 rounded-xl border border-border bg-surface p-6">
                <h3 className="mb-5 text-lg font-semibold">
                    Button Component
                </h3>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">
                        Primary
                    </Button>
                    <Button variant="secondary">
                        Secondary
                    </Button>
                    <Button variant="danger">
                        Delete
                    </Button>
                    <Button variant="ghost">
                        Ghost
                    </Button>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </div>
                <div className="mt-8">
                    <Card className="max-w-md">
                        <h2 className="text-lg font-semibold">
                            Мой первый курс
                        </h2>

                        <p className="mt-2 text-sm text-text-secondary">
                            Здесь будет описание курса.
                        </p>

                        <div className="mt-4">
                            <Button>Перейти</Button>
                        </div>
                    </Card>
                </div>
                <div className="mt-8 max-w-md">
                    <Card>
                        <h2 className="mb-5 text-lg font-semibold">
                            Input Component
                        </h2>
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="example@mail.com"
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter password"
                            />
                            <Input
                                label="Username"
                                placeholder="Enter username"
                                error="Username is already taken"
                            />
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    )
}



export default App
