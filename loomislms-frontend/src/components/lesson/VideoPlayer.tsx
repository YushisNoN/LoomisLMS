import { useEffect, useRef, useState } from 'react'
import { useAuthenticatedFile } from '../../hooks/useAuthenticatedFile'

interface Props {
    src: string
}

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return '0:00'

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function VideoPlayer({ src }: Props) {
    const { blobUrl, loading, error } = useAuthenticatedFile(src)

    const videoRef = useRef<HTMLVideoElement>(null)

    const [playing, setPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)

    useEffect(() => {
        const video = videoRef.current

        if (!video) return

        video.volume = volume
        video.muted = muted
    }, [volume, muted])

    async function togglePlay() {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            try {
                await video.play()
            } catch (error) {
                console.error('Ошибка воспроизведения:', error)
            }
        } else {
            video.pause()
        }
    }

    function handleSeek(value: number) {
        const video = videoRef.current
        if (!video) return

        video.currentTime = value
        setCurrentTime(value)
    }

    function toggleMute() {
        setMuted(prev => !prev)
    }

    function toggleFullscreen() {
        const video = videoRef.current
        if (!video) return

        if (!document.fullscreenElement) {
            video.parentElement?.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    if (loading) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-[#090910] text-gray-400">
                Загружаем видео...
            </div>
        )
    }

    if (error || !blobUrl) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-[#090910] text-red-400">
                {error || 'Видео недоступно'}
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090910]">
            <video
                ref={videoRef}
                src={blobUrl}
                preload="metadata"
                className="w-full"
                onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
            />

            <div className="space-y-3 p-4">
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={event => handleSeek(Number(event.target.value))}
                    className="w-full accent-violet-500"
                />

                <div className="flex items-center gap-4 text-sm text-gray-300">
                    <button onClick={togglePlay}>
                        {playing ? '❚❚' : '▶'}
                    </button>

                    <span>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="flex-1" />

                    <button onClick={toggleMute}>
                        {muted ? '🔇' : '🔊'}
                    </button>

                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={muted ? 0 : volume}
                        onChange={event => {
                            setVolume(Number(event.target.value))
                            setMuted(false)
                        }}
                        className="w-20 accent-violet-500"
                    />

                    <button onClick={toggleFullscreen}>
                        ⛶
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer