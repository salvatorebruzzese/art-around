import { ItemType } from '../backend/item/model.js'
export const sampleExplanations = {
  simple: [
    {
      level: 'simple',
      text: "Un'opera d'arte iconica e facilmente riconoscibile.",
      durationSeconds: 45,
    },
  ],
  standard: [
    {
      level: 'simple',
      text: 'Una breve introduzione per bambini e visitatori veloci.',
      durationSeconds: 60,
    },
    {
      level: 'normal',
      text: 'Analisi dettagliata del contesto storico e delle tecniche adottate.',
      durationSeconds: 180,
    },
  ],
  full: [
    {
      level: 'simple',
      text: 'Panoramica essenziale degli elementi visivi.',
      durationSeconds: 60,
    },
    {
      level: 'normal',
      text: 'Contesto storico e profilo biografico autore/periodo.',
      durationSeconds: 180,
    },
    {
      level: 'advanced',
      text: 'Analisi critico-storiografica, simbolismo e restauro.',
      durationSeconds: 300,
    },
  ],
}
const itemTemplates = [
  {
    name: 'Ritratto e Identità',
    type: ItemType.Artwork,
    tags: ['ritratto', 'pittura'],
  },
  {
    name: 'Stile e Movimento',
    type: ItemType.Style,
    tags: ['movimento', 'storia'],
  },
  {
    name: 'Tecnica di Composizione',
    type: ItemType.Technique,
    tags: ['tecnica', 'colore'],
  },
  {
    name: "Profilo dell'Artista",
    type: ItemType.Artist,
    tags: ['biografia', 'autore'],
  },
  {
    name: 'Scultura Principale',
    type: ItemType.Artwork,
    tags: ['scultura', 'marmo'],
  },
  {
    name: 'Bozzetto Preparatorio',
    type: ItemType.Artwork,
    tags: ['disegno', 'bozzetto'],
  },
  {
    name: 'Elemento Architettonico',
    type: ItemType.Other,
    tags: ['architettura', 'spazio'],
  },
  {
    name: 'Paesaggio Narrativo',
    type: ItemType.Artwork,
    tags: ['paesaggio', 'natura'],
  },
]
export function generateItemsForTour(
  museumName,
  userId,
  tourId,
  assetIds,
  count = 8,
) {
  return Array.from({ length: count }).map((_, index) => {
    const template = itemTemplates[index % itemTemplates.length]
    const expKeys = Object.keys(sampleExplanations)
    const selectedExplanations =
      sampleExplanations[expKeys[index % expKeys.length]]
    const res = {
      name: `${template.name} - ${museumName} #${index + 1}`,
      itemAuthor: userId,
      image: assetIds.length == 1 ? assetIds.at(0) : assetIds.pop(),
      tour: tourId,
      license: 'CC-BY-4.0',
      refs: [],
      tags: template.tags,
      explanations: selectedExplanations,
    }
    return res
  })
}
