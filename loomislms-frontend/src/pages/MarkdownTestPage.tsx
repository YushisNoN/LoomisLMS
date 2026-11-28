
import { useState } from 'react'
import MarkdownEditor from '../components/editor/MarkdownEditor'

function MarkdownTestPage() {
    const [content, setContent] = useState(`# Основы Python

Python — язык программирования.

## Переменные

Для создания переменной используется оператор присваивания:

\`\`\`python
name = "Alex"
age = 20

print(name, age)
\`\`\`

## Математика

Формула Пифагора:

$$
a^2 + b^2 = c^2
$$

Квадратное уравнение:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Пример списка:

- Переменные
- Условия
- Циклы

**Попробуй отредактировать этот текст!**`)

    return (
        <div className="min-h-screen bg-app p-6 text-text md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Проверка Markdown-редактора
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Здесь можно проверить форматирование и математические формулы.
                    </p>
                </div>

                <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    minHeight={500}
                />
            </div>
        </div>
    )
}

export default MarkdownTestPage
