var refPSD = new ActionReference();

function arrayUnique(a){
    var temp = []
        i = a.length;

    // ExtendScript has no indexOf function
    while(i--) {
        var found = false,
        n = temp.length;

        while (n--) {
            if(a[i] === temp[n]) {
                found = true;
            }
        }

        if(!found) {
            temp.push(a[i]);
        }
    }

    return temp;
}

function findFonts() {
    refPSD.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );

    // Get layers from PSD
    var countLayers = executeActionGet(refPSD).getInteger(charIDToTypeID('NmbL'))+1,
        fonts = [];

    // Loop through each layer
    while(countLayers--) {
        var refLayer = new ActionReference(),
            descLayer,
            layerStyles,
            countStyles;

        refLayer.putIndex( charIDToTypeID( 'Lyr ' ), countLayers );

        // Catch error when no backgroundLayer is present
        try {
            descLayer = executeActionGet(refLayer);
        } catch (e) {
            continue;
        }

        // Only proceed if text layer
        if(!descLayer.hasKey(stringIDToTypeID( 'textKey' ))) continue;

        // Get list of styles (in case of multiple fonts in a text layer)
        layerStyles = descLayer.getObjectValue(stringIDToTypeID('textKey')).getList(stringIDToTypeID('textStyleRange'));
        countStyles = layerStyles.count;

        // Loop through each style and get the font name
        while(countStyles--) {
            try {
                var fontName = layerStyles.getObjectValue(countStyles).getObjectValue(stringIDToTypeID('textStyle')).getString(stringIDToTypeID('fontPostScriptName'));
                fonts.push(fontName);
            } catch (e) {
                continue;
            }
        }
    }

    // Return a unique and sorted array of font names
    return arrayUnique(fonts).sort();
}

if (documents.length) {
    var fontsFound = findFonts();
    alert(fontsFound.length +' fonts found \n'+fontsFound.join('\n'));
} else {
    alert('No fonts found \nOpen a PSD before running this script',);
}
