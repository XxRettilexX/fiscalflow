export const CATEGORY_ICONS: { [key: string]: string } = {
    alimentari: "🛒",
    spesa: "🛒",
    groceries: "🛒",
    ristorante: "🍽️",
    bar: "🍷",
    cibo: "🍔",
    benzina: "⛽",
    auto: "🚗",
    trasporto: "🚌",
    cinema: "🎬",
    intrattenimento: "🎮",
    svago: "🎪",
    palestra: "🏋️",
    salute: "⚕️",
    farmacia: "💊",
    abbigliamento: "👕",
    shopping: "👜",
    elettronica: "📱",
    casa: "🏠",
    utenze: "💡",
    bollette: "📄",
    affitto: "🏘️",
    mutuo: "🏦",
    assicurazione: "🛡️",
    abbonamenti: "📺",
    spotify: "🎵",
    netflix: "📺",
    default: "💰",
};

export function getCategoryIcon(category: string): string {
    const normalized = category.toLowerCase().trim();

    // Controlla corrispondenza diretta
    if (CATEGORY_ICONS[normalized]) {
        return CATEGORY_ICONS[normalized];
    }

    // Controlla se la categoria contiene una delle parole chiave
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
        if (normalized.includes(key)) {
            return icon;
        }
    }

    return CATEGORY_ICONS.default;
}
