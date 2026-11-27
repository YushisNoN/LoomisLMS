import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuthenticatedFile } from '../../hooks/useAuthenticatedFile'

interface Props {
    src: string
}

const playbackRates = [0.25, 0.5, 1, 1.25, 1.5, 2]

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
    const [playbackRate, setPlaybackRate] = useState(1)
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

    function changePlaybackRate(rate: number) {
        const video = videoRef.current
        if (!video) return

        video.playbackRate = rate
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
                key={blobUrl}
                ref={videoRef}
                src={blobUrl}
                preload="metadata"
                className="w-full cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={event => {
                    setDuration(event.currentTarget.duration)
                    setPlaybackRate(event.currentTarget.playbackRate)
                }}
                onRateChange={event => setPlaybackRate(event.currentTarget.playbackRate)}
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

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <button onClick={togglePlay}>
                        {playing ? '❚❚' : '▶'}
                    </button>

                    <span>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="flex-1" />

                    <label className="flex items-center gap-2">
                        Скорость
                        <span className="relative">
                            <select
                                value={playbackRate}
                                onChange={event => changePlaybackRate(Number(event.currentTarget.value))}
                                className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#12121d] py-1 pl-2 pr-7 text-gray-300 focus-visible:outline-violet-500"
                            >
                                {playbackRates.map(rate => (
                                    <option key={rate} value={rate}>{rate}×</option>
                                ))}
                            </select>
                            <ChevronDown
                                aria-hidden="true"
                                className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400"
                            />
                        </span>
                    </label>

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
