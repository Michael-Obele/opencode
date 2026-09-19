export function sessionPanelLayout(input: { review: boolean; files: boolean }) {
  return {
    visible: input.review || input.files,
    stacked: false,
  }
}
