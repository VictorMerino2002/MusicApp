const getRGBValues = (rgbString: string): number[] | null  => {
    const match = rgbString.match(/\d+/g);
    return match ? match.map(Number) : null;
}

export const lowerColor = (rgbString: string): string => {
    const rgb = getRGBValues(rgbString);
    if (!rgb) return rgbString;

    const lowColor = rgb.map(color => (color > 150 ? Math.max(color - 50, 0) : color));

    return `rgb(${lowColor.join(", ")})`;
}