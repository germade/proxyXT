import { h } from "preact"

export function FilterSymbolSvg({
    size = 14,
    width = size,
    height = size,
    color = "currentColor",
}) {
    return (
        <svg
            width={typeof width === 'string' ? width : `${width}px`}
            height={typeof height === 'string' ? height : `${height}px`}
            viewBox="0 0 32 32"
        >
            <path fill="none" stroke={color} stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M3.241 7.646 13 19v9l6-4v-5l9.759-11.354c.556-.65.089-1.646-.773-1.646H4.014c-.862 0-1.329.996-.773 1.646"/>
        </svg>
    )
}