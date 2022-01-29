if (typeof jQuery === 'undefined') { throw 'no jquery'; }

// 将rgb颜色转成hex
function colorRGB2Hex(color) {
    var rgb = color.split(',');
    var r = parseInt(rgb[0]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2]);

    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
}

/**
 * 获取颜色值
 */
const color2RGB = (color) => {
    if (typeof color !== 'string' || (color.length !== 7 && color.length !== 4)) return [0, 0, 0];
    color = color.substr(1);
    if (color.length === 3) {
        return color.split('').map(str => parseInt(str + str, 16));
    }

    let result = [];
    for (let i = 0; i < 6; i += 2) {
        result.push(parseInt(color.substr(i, 2), 16));
    }

    return result;
}

/**
 * 加深：correctionFactor<0
   变亮：correctionFactor>0
   -1.0f <= correctionFactor <= 1.0f

   @colorStr  颜色值：#ff0000
 */
const changeColor = (colorStr, correctionFactor) => {
    let color = color2RGB(colorStr)
    let red = parseFloat(color[0]);
    let green = parseFloat(color[1]);
    let blue = parseFloat(color[2]);

    if (correctionFactor < 0) {
        correctionFactor = 1 + correctionFactor;
        red *= correctionFactor;
        green *= correctionFactor;
        blue *= correctionFactor;
    }
    else {
        red = (255 - red) * correctionFactor + red;
        green = (255 - green) * correctionFactor + green;
        blue = (255 - blue) * correctionFactor + blue;
    }
    red = parseInt(Math.min(255, Math.max(0, red)));
    green = parseInt(Math.min(255, Math.max(0, green)));
    blue = parseInt(Math.min(255, Math.max(0, blue)));

    let components = [red, green, blue];
    return colorRGB2Hex(components.join(','),0.1);
}