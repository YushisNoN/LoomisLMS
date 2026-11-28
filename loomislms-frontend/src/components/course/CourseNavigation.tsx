import { useEffect, useId, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import CourseSidebar from './CourseSidebar'
import Button from '../ui/Button'

type Props = Omit<ComponentProps<typeof CourseSidebar>, 'onClose'>

function CourseNavigation(props: Props) {
    const dialogId = useId()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false)

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 64rem)')

        function closeOnDesktop(event: MediaQueryListEvent) {
            if (event.matches) dialogRef.current?.close()
        }

        desktop.addEventListener('change', closeOnDesktop)
        return () => desktop.removeEventListener('change', closeOnDesktop)
    }, [])

    useEffect(() => {
        if (!isCourseMenuOpen) return

        const root = document.documentElement
        const previousOverflow = root.style.overflow
        root.style.overflow = 'hidden'

        return () => {
            root.style.overflow = previousOverflow
        }
    }, [isCourseMenuOpen])

    function openMenu(trigger: HTMLButtonElement) {
        const dialog = dialogRef.current
        if (!dialog || dialog.open) return

        triggerRef.current = trigger
        dialog.showModal()
        setIsCourseMenuOpen(true)
    }

    function closeMenu() {
        dialogRef.current?.close()
    }

    function restoreFocus() {
        setIsCourseMenuOpen(false)
        triggerRef.current?.focus({ preventScroll: true })
    }

    return (
        <>
            <div className="hidden rounded-2xl border border-white/10 bg-[#12121d]
                lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
                <CourseSidebar {...props} />
            </div>

            <Button
                size="sm"
                className="fixed left-0 top-24 z-40 size-11 rounded-l-none rounded-r-xl
                    shadow-lg lg:hidden"
                aria-label="Открыть программу курса"
                aria-haspopup="dialog"
                aria-controls={dialogId}
                aria-expanded={isCourseMenuOpen}
                onClick={event => openMenu(event.currentTarget)}
            >
                <span
                    aria-hidden="true"
                    className="relative h-4 w-5 shrink-0 rounded-sm border-2 border-current
                        before:absolute before:inset-y-0 before:left-1 before:border-l-2
                        before:border-current"
                />
            </Button>

            <dialog
                id={dialogId}
                ref={dialogRef}
                aria-label="Программа курса"
                className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none
                    overflow-hidden bg-transparent text-white backdrop:bg-black/60"
                onClose={restoreFocus}
                onClick={event => {
                    if (event.target === event.currentTarget) closeMenu()
                }}
            >
                <div className="h-full w-[90%] max-w-[380px] overflow-y-auto
                    overscroll-contain border-r border-white/10 bg-[#12121d]
                    motion-safe:transition-transform motion-safe:duration-200
                    motion-safe:starting:-translate-x-full">
                    <CourseSidebar
                        {...props}
                        onClose={closeMenu}
                        onOpenLesson={(moduleId, lesson) => {
                            props.onOpenLesson(moduleId, lesson)
                            closeMenu()
                        }}
                    />
                </div>
            </dialog>
        </>
    )
}

export default CourseNavigation
