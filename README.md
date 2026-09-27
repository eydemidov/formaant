# Formant

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

## Voice profiles

Reference vowel profiles (male and female F1/F2) are available for:

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
