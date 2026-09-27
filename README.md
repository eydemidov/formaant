# Formant

A standalone browser app for language learning - specifically pronunciation and accent training.

Originally based on [Web Praat](https://justinchuby.github.io/web-praat/), [Praat](https://www.fon.hum.uva.nl/praat/)'s browser port.

<img width="2936" height="1672" alt="image" src="https://github.com/user-attachments/assets/a477349d-c63d-4386-af4d-32ca96b7a462" />


## How to Train Your Pronunciation with Formants

When you pronounce a vowel, the shape of your mouth changes the sound. These changes can be measured using **formants**.

The two most useful for pronunciation are **F1** and **F2**:

- **F1** roughly shows how open or closed the vowel is.
- **F2** roughly shows how far forward or back the vowel is.

Together, F1 and F2 can be plotted in a **vowel space**. This lets you compare your pronunciation with a target vowel and adjust your tongue position.

Record yourself, compare your result with the target, adjust your pronunciation, and try again.

Formants are simply a way to turn pronunciation into **visual feedback**, they are not a substitute for common sense.

Don't take the numbers literally, especially when they make no sense.

If you are trying to produce a really deep sound but it shows a very high F2, it means the formant was not detected correctly. Look at the spectrogram yourself or try to fiddle with the settings.

### Useful links

- [IPA chart](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet_chart) - overview of IPA vowels, consonants, stress, and tone symbols.
- [Vowel diagram / vowel space](https://en.wikipedia.org/wiki/Vowel_diagram) — how vowels are organized by height and frontness/backness, including their relationship to F1 and F2.

## Features

- Record or load audio; view its waveform, spectrogram, pitch, formants, and intensity.
- Automatic IPA labels and F1/F2 vowel-space comparison.
- Male and female profiles for British/American English, Mandarin, French, Japanese, and Serbian.
- Create custom vowel profiles.

## Voice profiles

Reference vowel profiles are available for:

- [**British English (RP)**](https://www.cambridge.org/core/journals/english-language-and-linguistics/article/abs/vowels-of-contemporary-rp-vowel-formant-measurements-for-bbc-newsreaders1/3109BF90B3630215DAABD95111C3DD9C)
- [**American English**](https://pubmed.ncbi.nlm.nih.gov/7759650/)
- [**Mandarin Chinese**](https://aclanthology.org/Y06-1037.pdf)
- [**French**](https://www.isca-archive.org/interspeech_2005/gendrot05_interspeech.pdf)
- [**Japanese**](https://www.internationalphoneticassociation.org/icphs-proceedings/ICPhS2019/papers/ICPhS_720.pdf)
- [**Serbian**](https://doi.org/10.18485/ms_zmsfil.2021.64.2.3)

### Coming soon (maybe):

- Diphtongs for English
- Pitch training for Mandarin

## Getting Started

```bash
npm install
npm run dev     # dev server at localhost:5173
npm test        # run tests
npm run build   # production build
```
