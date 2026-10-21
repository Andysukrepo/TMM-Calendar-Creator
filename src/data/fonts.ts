import { FontCategory } from '../types';

export const popularFontsByCategory: Record<FontCategory, string[]> = {
  "sans-serif": [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
    "Inter", "Raleway", "Ubuntu", "Work Sans", "Fira Sans",
    "Quicksand", "Archivo"
  ],
  "serif": [
    "Merriweather", "Playfair Display", "Lora", "PT Serif",
    "Libre Baskerville", "Crimson Text", "Arvo"
  ],
  "display": [
    "Oswald", "Bebas Neue", "Lobster", "Abril Fatface",
    "Righteous", "Patua One", "Titan One"
  ],
  "handwriting": [
    "Dancing Script", "Pacifico", "Caveat", "Satisfy",
    "Great Vibes", "Sacramento", "Yellowtail"
  ]
};

export const googleFontsByCategory: Record<FontCategory, string[]> = {
  "sans-serif": [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Oswald", "Source Sans Pro",
    "Raleway", "PT Sans", "Roboto Condensed", "Nunito", "Rubik", "Mukta", "Arimo",
    "Noto Sans", "Dosis", "Josefin Sans", "Quicksand", "Cabin", "Inter", "Work Sans",
    "Karla", "Barlow", "Hind", "Oxygen", "Fira Sans", "Ubuntu", "Mulish", "Manrope",
    "DM Sans", "Plus Jakarta Sans", "Space Grotesk", "Outfit", "Red Hat Display",
    "Lexend", "Archivo", "Figtree", "Sora", "Urbanist", "Albert Sans"
  ],
  "serif": [
    "Merriweather", "PT Serif", "Playfair Display", "Lora", "Libre Baskerville",
    "Bitter", "Noto Serif", "Crimson Text", "Arvo", "Cardo", "Old Standard TT",
    "Vollkorn", "Spectral", "Cormorant", "Source Serif Pro", "Libre Caslon Text",
    "EB Garamond", "Alegreya", "Crete Round", "Trocchi", "Judson", "Quando",
    "Domine", "Neuton", "Literata", "Crimson Pro", "Fraunces"
  ],
  "display": [
    "Righteous", "Bebas Neue", "Alfa Slab One", "Permanent Marker", "Abril Fatface",
    "Paytone One", "Fredoka One", "Passion One", "Bungee", "Black Ops One",
    "Monoton", "Yellowtail", "Lobster", "Fugaz One", "Bangers", "Titan One",
    "Ultra", "Russo One", "Anton", "Rowdies", "Staatliches",
    "Secular One", "Cinzel", "Gruppo", "Audiowide", "Megrim", "Orbitron"
  ],
  "handwriting": [
    "Dancing Script", "Pacifico", "Shadows Into Light", "Indie Flower",
    "Amatic SC", "Caveat", "Satisfy", "Great Vibes", "Sacramento", "Kaushan Script",
    "Cookie", "Courgette", "Patrick Hand", "Permanent Marker", "Shadows Into Light Two",
    "Nothing You Could Do", "Rock Salt", "Covered By Your Grace", "Gloria Hallelujah",
    "Homemade Apple", "Architects Daughter", "Bad Script", "Sue Ellen Francisco",
    "Handlee", "Damion", "Allura", "Tangerine", "Marck Script"
  ]
};

const loadedFonts = new Set<string>();

export function ensureGoogleFontLoaded(fontFamily: string) {
  if (!fontFamily) return;
  // Strip quotes if any
  const cleanName = fontFamily.replace(/['",]/g, '').trim();
  if (cleanName.toLowerCase() === 'system-ui' || cleanName.toLowerCase() === 'sans-serif' || cleanName.toLowerCase() === 'serif') {
    return;
  }
  if (loadedFonts.has(cleanName)) return;

  loadedFonts.add(cleanName);
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${cleanName.replace(/\s+/g, '+')}:wght@300;400;600;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}
