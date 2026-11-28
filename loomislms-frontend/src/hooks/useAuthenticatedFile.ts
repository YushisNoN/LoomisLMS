import { useEffect, useState } from 'react'

export function useAuthenticatedFile(url: string) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!url) {
            setLoading(false)
            setError('Файл не указан')
            return
        }

        const controller = new AbortController()
        let objectUrl: string | null = null

        async function loadFile() {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(
                    `http://localhost:8080${url}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        },
                        signal: controller.signal
                    }
                )

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки: ${response.status}`)
                }

                const blob = await response.blob()

                objectUrl = URL.createObjectURL(blob)
                setBlobUrl(objectUrl)
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return
                }

                setError('Не удалось загрузить файл')
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadFile()

        return () => {
            controller.abort()

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [url])

    return { blobUrl, loading, error }
}