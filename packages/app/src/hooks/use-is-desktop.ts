import { createMediaQuery } from "@solid-primitives/media"

export const useIsDesktop = () => createMediaQuery("(min-width: 768px)")
export const useIsMobile = () => createMediaQuery("(max-width: 767px)")
