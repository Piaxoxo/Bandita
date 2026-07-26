// Shared, mutable audio-reactivity state. Written by SoundControl's analyser
// loop, read by the WebGL scene every frame — never React state.
export const audioState = {
  level: 0, // 0..~1 smoothed loudness of the soundtrack
  active: false, // true once the analyser is running
};
