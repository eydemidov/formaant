# Web Praat

This fork of Web Praat is geared towards language learning, with features focused on accent training.

A browser-based port of [Praat](https://www.fon.hum.uva.nl/praat/) for phonetics research, teaching, and interactive exploration. Zero installation — runs entirely in the browser.

<!--[![CI](https://github.com/justinchuby/web-praat/actions/workflows/ci.yml/badge.svg)](https://github.com/justinchuby/web-praat/actions/workflows/ci.yml)-->
[![codecov](https://codecov.io/gh/justinchuby/web-praat/graph/badge.svg)](https://codecov.io/gh/justinchuby/web-praat)

<img width="2354" height="1212" alt="image" src="https://github.com/user-attachments/assets/14fa2de8-3f54-44ec-8b70-86c80b718e4b" />

**[Original Web Praat demo →](https://justinchuby.github.io/web-praat/)**

## Changes compared to the original

- Fixed spectrogram blinking during recording and a formant-tracking gap that could disrupt vowel segmentation.
- Added a toggle and average F1/F2 readings to IPA vowel annotations for each detected segment.
- Added selectable vowel-matching profiles for Modern RP, American English, Mandarin Chinese, French, Japanese, and Serbian, with separate women’s and men’s data.
- Matched vowels against each profile’s F1/F2 targets and available ranges, with a 5% range allowance; added voicing and spectral-energy checks to reduce consonant labels.
- Made the vowel-space chart scale to the selected profile and saved analysis, filter, profile, and overlay settings locally across reloads.

## Available voice profiles and their sources

Each profile uses **F1 and F2** to place vowels on a chart. Values are in hertz (Hz), with separate women’s and men’s profiles. They represent measured groups of speakers, so an individual voice may fall elsewhere. The profiles cover single vowels; diphthongs are not included.

| Profile | What’s included | Source |
|---|---|---|
| **British English (RP)** | 11 vowels from seven women and seven men reading BBC news. Means and ranges are based on individual speaker measurements. | [Bjelaković (2017)](https://www.cambridge.org/core/journals/english-language-and-linguistics/article/abs/vowels-of-contemporary-rp-vowel-formant-measurements-for-bbc-newsreaders1/3109BF90B3630215DAABD95111C3DD9C) |
| **American English** | 10 vowels from 48 women and 45 men in a Midwestern US speech study. Values use measurements taken halfway through each vowel. | [Hillenbrand and colleagues (1995)](https://pubmed.ncbi.nlm.nih.gov/7759650/) · [measurement data](https://github.com/santiagobarreda/hillenbrand_et_al_1995) |
| **Mandarin Chinese** | 10 vowels from 212 women and 126 men training as broadcasters. The source provides averages but no minimum or maximum values. | [Meng, Chen, and Li (2006)](https://aclanthology.org/Y06-1037.pdf) |
| **French** | 10 oral vowels from 15 women and 15 men in broadcast speech. The profile uses published averages; minimum and maximum values are unavailable. | [Gendrot and Adda-Decker (2005)](https://www.isca-archive.org/interspeech_2005/gendrot05_interspeech.pdf) |
| **Japanese (Tokyo area)** | Five short vowels from eight women and eight men. Averages come from the paper; ranges were calculated across individual speaker averages in its open dataset. | [Yazawa and Kondo (2019)](https://www.internationalphoneticassociation.org/icphs-proceedings/ICPhS2019/papers/ICPhS_720.pdf) · [measurement data](https://zenodo.org/records/15227304) |
| **Serbian (Novi Sad)** | Seven chart entries from 10 women and 10 men: **i, e, eː, a, o, oː, u**. Short and long **i, a, u** were averaged into one entry each; short and long **e, o** remain separate because their measured positions differ more. The `ː` mark means “long.” | [Marković and Sredojević (2021)](https://doi.org/10.18485/ms_zmsfil.2021.64.2.3) |

## Why web-praat?

- **Zero install** — open a browser, start analyzing
- **Interactive** — real-time parameter sliders, vowel space visualization, live recording with spectrogram
- **Teaching-focused** — students can see how LPC order / pitch range / voicing threshold affect results instantly
- **Mobile-friendly** — works on phones and tablets with touch gestures
- **Private** — audio never leaves your browser

For production research pipelines, use [Praat](https://www.praat.org/) or [Parselmouth](https://parselmouth.readthedocs.io/).

## Features

### Acoustic Analysis
- Wideband/narrowband spectrogram (6 window functions, 8 colormaps, WebGPU-accelerated FFT)
- Pitch (F0) — normalized autocorrelation + Viterbi path tracking
- Formants — Burg LPC, adjustable order 6–24
- Intensity (dB SPL), Harmonicity (HNR), Voice Quality (jitter/shimmer)
- MFCC, LTAS, Cochleagram, Excitation Pattern, Spectrum Slice
- Point Process, Rhythm Metrics (PVI, %V, ΔC)

### Annotation
- Full TextGrid editor (IntervalTier + TextTier)
- Praat long + short format import/export, ELAN (.eaf) import
- Boundary manipulation, keyboard navigation, controlled vocabulary

### Visualization
- Pitch contour, formant tracks (F1–F3), intensity curve overlays
- IPA vowel annotation tier
- Vowel Space panel (F1×F2 scatter + trajectory, selectable voice profiles)
- Publication-quality PNG figure export (2400×1200)
- 4 themes (Catppuccin Mocha/Latte/Frappe/Macchiato)

### Script Editor
- Multi-tab CodeMirror 6 editor (Praat Script + JavaScript)
- Praat Script interpreter (procedures, loops, string operations)
- JavaScript API (`praat.toPitch`, `praat.toFormant`, etc.)
- Batch processing — run scripts on multiple audio files, export CSV

### Tools
- Manipulation Editor (PSOLA), Pitch/Formant/Duration/Amplitude Tier editors
- Vocal Tract Editor, Spectrum Editor
- Noise reduction (Web Worker), Normalize, Reverse, Remove Silence
- All effects undoable (⌘Z), Biquad/Butterworth filtering
- Perception experiments (MFC), Speech Synthesizer, Pitch Sonification
- Plugin system (5 built-in), Command Palette (⌘⇧P)

### Recording & Playback
- Live recording with real-time spectrogram (AudioWorklet + fallback)
- iOS/Safari compatible
- Selection loop playback
- Long audio (>5 min) waveform-only mode with on-demand region analysis

## Accuracy

Validated against Praat 6.4 via [Parselmouth](https://parselmouth.readthedocs.io/) (same LPC order):

| Measurement | vs Praat |
|---|---|
| Pitch (F0) | ±5 Hz |
| Formants (F1) | ±50 Hz |
| Formants (F2) | ±50 Hz (well-separated); varies for close F2/F3 |
| Intensity (relative) | ±2 dB |

See [`docs/METHODS.md`](docs/METHODS.md) for algorithm citations and [`tests/validation/`](tests/validation/) for the full cross-validation suite.

## Getting Started

```bash
npm install
npm run dev     # dev server at localhost:5173
npm test        # run tests
npm run build   # production build
```

## DSP Implementation

All signal processing implemented in TypeScript — no third-party DSP libraries.

| Component | Algorithm |
|---|---|
| FFT | Radix-2 Cooley-Tukey (+ WebGPU compute shader) |
| Spectrogram | STFT with configurable window |
| Pitch | Normalized autocorrelation + parabolic interpolation + Viterbi |
| Formants | Burg LPC → polynomial root finding → bandwidth filtering |
| Noise reduction | Spectral subtraction (Boll 1979) |
| Filters | RBJ-style biquad IIR + Butterworth cascades |
| WAV export | PCM16 RIFF/WAVE encoding |

## References

- Boersma, P. & Weenink, D. (2024). *Praat: doing phonetics by computer.* https://www.praat.org/
- Boersma, P. (1993). Accurate short-term analysis of the fundamental period and the harmonics-to-noise ratio of a sampled sound. *IFA Proceedings 17*, 97–110.
- Burg, J.P. (1975). Maximum entropy spectral analysis. PhD thesis, Stanford University.
- Davis, S.B. & Mermelstein, P. (1980). Comparison of parametric representations for monosyllabic word recognition. *IEEE TASSP*, 28(4), 357–366.

## License

GPL-3.0
