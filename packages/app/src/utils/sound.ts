export const SOUND_OPTIONS = [] as const
export type SoundOption = (typeof SOUND_OPTIONS)[number]
export type SoundID = string
export function soundSrc(_id: string | undefined) { return Promise.resolve(undefined as string | undefined) }
export function playSound(_src: string | undefined) { return () => {} }
export function playSoundById(_id: string | undefined) { return Promise.resolve(undefined) }
