export function getShadowRootExtraStyles(
    virtualKeyboardTooltip: string
): string {
    return `
        .ML__caret::after {
            --_caret-width: 1px !important;
            border-radius: 0 !important;
        }
        .ML__content:not(.ML__focused) .ML__selected {
            color: #000000
        }
        [data-tooltip]::after {
            content: '${virtualKeyboardTooltip}' !important;
        }
    `;
}
