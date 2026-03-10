export const Colors = {
    ink: '#111111',           // --ink
    inkLight: '#1A1A1A',      // --ink-light
    inkLighter: '#222222',    // --ink-lighter
    inkBorder: '#333333',     // --ink-border
    gold: '#D4AF37',          // --gold
    goldLight: '#F3E5AB',     // --gold-light
    textPrimary: '#F5F5F5',   // --text-primary
    textSecondary: '#A3A3A3', // --text-secondary
    textMuted: '#737373',     // --text-muted
    error: '#EF4444',         // text-red-500
    success: '#22C55E',       // text-green-500
};

export const SharedStyles = {
    container: {
        flex: 1,
        backgroundColor: Colors.ink,
    },
    card: {
        backgroundColor: Colors.inkLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.inkBorder,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '700' as const,
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(212, 175, 55, 0.15)', // Gold with opacity
        color: Colors.gold,
        borderRadius: 4,
        fontSize: 10,
        overflow: 'hidden' as const,
    },
};
