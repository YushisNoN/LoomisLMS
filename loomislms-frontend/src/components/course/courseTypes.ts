export interface Module {
    id: string
    title: string
    description: string | null
    position: number
}

export interface Lesson {
    id: string
    title: string
    content: string | null
    type: 'LECTURE' | 'TEXT' | 'TEST' | 'CODING_TASK'
    position: number
}
