# Web Praat

A standalone browser app for language learning - specifically pronunciation and accent training.

Originally based on [Web Praat](https://justinchuby.github.io/web-praat/), [Praat](https://www.fon.hum.uva.nl/praat/)'s browser port.

<!--<img width="2354" height="1212" alt="image" src="https://github.com/user-attachments/assets/14fa2de8-3f54-44ec-8b70-86c80b718e4b" />-->

## How to Train Your Pronunciation with Formants

When you pronounce a vowel, the shape of your mouth changes the sound. These changes can be measured using **formants**.

The two most useful for pronunciation are **F1** and **F2**:

- **F1** roughly shows how open or closed the vowel is.
- **F2** roughly shows how far forward or back the vowel is.

Together, F1 and F2 can be plotted in a **vowel space**. This lets you compare your pronunciation with a target vowel and adjust your tongue position.

### What about pitch?

**F0** represents pitch.

It is useful for practicing:

- intonation
- lexical tone
- stress
- sentence melody

In short:

**F1 → vowel height**  
**F2 → vowel front/back position**  
**F0 → pitch**

You do not need to memorize the numbers. Record yourself, compare your result with the target, adjust your pronunciation, and try again.

Formants are simply a way to turn pronunciation into **visual feedback**.

### Useful links

- [International Phonetic Alphabet (IPA)](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet) - symbols used to represent speech sounds.
- [IPA chart](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet_chart) - overview of IPA vowels, consonants, stress, and tone symbols.
- [Vowel diagram / vowel space](https://en.wikipedia.org/wiki/Vowel_diagram) — how vowels are organized by height and frontness/backness, including their relationship to F1 and F2.
- [Formants](https://en.wikipedia.org/wiki/Formant) - what F1, F2, F3, etc. represent acoustically.
- [Fundamental frequency (F0)](https://en.wikipedia.org/wiki/Fundamental_frequency) - the acoustic measurement closely related to perceived pitch.

## Features

### Pronunciation Analysis
- Pitch (F0) tracking
- Formant analysis (F1, F2, F3)
- Wideband and narrowband spectrograms
- Intensity visualization

### Vowel Training
- F1 × F2 vowel-space visualization
- Vowel trajectories over time
- IPA vowel labels
- Selectable reference profiles for Modern RP, American English, Mandarin Chinese, French, Japanese, and Serbian
- Separate reference data for women and men
- Visual comparison between the learner’s vowels and target vowels

### Recording & Playback
- Record pronunciation directly in the app
- Select and replay parts of a recording
- Loop playback for repeated practice

### Practice
- Record a word, vowel, or sentence
- Inspect pitch and vowel formants
- Compare pronunciation with a selected target profile
- Repeat and adjust pronunciation based on the visual feedback

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
