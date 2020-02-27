var uaInfo = uaInfo || {};
	
var ua = navigator.userAgent.toLowerCase(),
    _platform = navigator.platform.toLowerCase(),

    _bWin = (_platform == 'win32') || (_platform == 'win64') || (_platform == 'windows'),
    
    _nMSIE = ua.indexOf('msie'),
    _nTrident = ua.indexOf('trident'),
    _nRV = ua.indexOf('rv:'),
    _nEdge = ua.indexOf('edge'),

    _tmp = ua.match(/version\/([\d.]+).*safari/),
    _bSafari = _tmp ? !0 : !1,
    _nSafari = _tmp ? _tmp[1] : 0,

    _nFirefox = ua.indexOf('firefox'),
    _bFirefox = (_nFirefox != -1),
    
    _bEdge = _bWin && !_bFirefox && (_nEdge != -1),
    
    _indexOfChrome = ua.indexOf('chrome'),
    _bChrome =  !_bEdge && (_indexOfChrome != -1),

    _bIE = _bWin && !_bFirefox && !_bEdge && !_bChrome && (_nMSIE != -1 || _nTrident != -1 || _nRV != -1),

    _strBrowserVersion = '',
    _mainVer = 0;


var _deviceType,
    bIsIpad = ua.match(/ipad/i) == "ipad",
    bIsIphoneOs = ua.match(/iphone os/i) == "iphone os",
    bIsMidp = ua.match(/midp/i) == "midp",
    bIsUc7 = ua.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
    bIsUc = ua.match(/ucweb/i) == "ucweb",
    bIsAndroid = ua.match(/android/i) == "android",
    bIsCE = ua.match(/windows ce/i) == "windows ce",
    bIsWM = ua.match(/windows mobile/i) == "windows mobile";
    
if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    _deviceType = 'phone'; 
} else {
    _deviceType = 'pc'; 
}  


if(_bEdge) {
    _tmp = ua.slice(_nEdge + 5);
    _tmp = _tmp.slice(0, _tmp.indexOf(' '));
    _strBrowserVersion = _tmp;
    
} else if (_bChrome) {
    _tmp = ua.slice(_indexOfChrome + 7);
    _tmp = _tmp.slice(0, _tmp.indexOf(' '));
    _strBrowserVersion = _tmp;

} else if (_bFirefox) {	// FF
    _tmp = ua.slice(_nFirefox + 8);
    _tmp = _tmp.slice(0, _tmp.indexOf(' '));
    _strBrowserVersion = _tmp;

} else if (_bIE) {
    if (_nMSIE != -1) {
        // 'msie'
        _tmp = ua.slice(_nMSIE + 4);
        _tmp = _tmp.slice(0, _tmp.indexOf(';'));
        _strBrowserVersion = _tmp;
    } else if (_nRV != -1) {
        // 'rv:'
        _tmp = ua.slice(_nRV + 3);
        _tmp = _tmp.slice(0, _tmp.indexOf(';'));
        _tmp = _tmp.slice(0, _tmp.indexOf(')'));
        _strBrowserVersion = _tmp;
    } else if (_nTrident != -1) {
        // 'trident'
        _tmp = ua.slice(_nTrident + 7);
        _tmp = _tmp.slice(0, _tmp.indexOf(';'));
        _strBrowserVersion = _tmp;
    }


} else if (_bSafari) {
    if (_tmp) {
        _strBrowserVersion = _tmp[1];
    }
}

if(_strBrowserVersion.indexOf('.') > -1)
    _mainVer = _strBrowserVersion.slice(0, _strBrowserVersion.indexOf('.')) * 1.0;
	
uaInfo = {
    bWin: _bWin,
    
    bIE: _bIE,
    bEdge: _bEdge,
    bFirefox: _bFirefox,
    bChrome: _bChrome,
    bSafari: _bSafari,
    
    strVersion: _strBrowserVersion,
    mainVer: _mainVer,
    deviceType: _deviceType
    
};

/*
Keillion get from https://github.com/exif-js/exif-js and fix some bug.

The MIT License (MIT)
Copyright (c) 2008 Jacob Seidelin
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() {

    var debug = false;

    var root = self;

    var EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000 : "ExifVersion",             // EXIF version
        0xA000 : "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",              // Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",         // Valid width of meaningful image
        0xA003 : "PixelYDimension",         // Valid height of meaningful image
        0x9101 : "ComponentsConfiguration", // Information about channels
        0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C : "MakerNote",               // Any desired information written by the manufacturer
        0x9286 : "UserComment",             // Comments by user

        // related file
        0xA004 : "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",            // Exposure time (in seconds)
        0x829D : "FNumber",                 // F number
        0x8822 : "ExposureProgram",         // Exposure program
        0x8824 : "SpectralSensitivity",     // Spectral sensitivity
        0x8827 : "ISOSpeedRatings",         // ISO speed rating
        0x8828 : "OECF",                    // Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",       // Shutter speed
        0x9202 : "ApertureValue",           // Lens aperture
        0x9203 : "BrightnessValue",         // Value of brightness
        0x9204 : "ExposureBias",            // Exposure bias
        0x9205 : "MaxApertureValue",        // Smallest F number of lens
        0x9206 : "SubjectDistance",         // Distance to subject in meters
        0x9207 : "MeteringMode",            // Metering mode
        0x9208 : "LightSource",             // Kind of light source
        0x9209 : "Flash",                   // Flash status
        0x9214 : "SubjectArea",             // Location and area of main subject
        0x920A : "FocalLength",             // Focal length of the lens in mm
        0xA20B : "FlashEnergy",             // Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",    //
        0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",         // Location of subject in image
        0xA215 : "ExposureIndex",           // Exposure index selected on camera
        0xA217 : "SensingMethod",           // Image sensor type
        0xA300 : "FileSource",              // Image source (3 == DSC)
        0xA301 : "SceneType",               // Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",              // Color filter array geometric pattern
        0xA401 : "CustomRendered",          // Special processing
        0xA402 : "ExposureMode",            // Exposure mode
        0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",       // Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",        // Type of scene
        0xA407 : "GainControl",             // Degree of overall image gain adjustment
        0xA408 : "Contrast",                // Direction of contrast processing applied by camera
        0xA409 : "Saturation",              // Direction of saturation processing applied by camera
        0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",    //
        0xA40C : "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

     // EXIF 2.3 Spec
    var IFD1Tags = EXIF.IFD1Tags = {
        0x0100: "ImageWidth",
        0x0101: "ImageHeight",
        0x0102: "BitsPerSample",
        0x0103: "Compression",
        0x0106: "PhotometricInterpretation",
        0x0111: "StripOffsets",
        0x0112: "Orientation",
        0x0115: "SamplesPerPixel",
        0x0116: "RowsPerStrip",
        0x0117: "StripByteCounts",
        0x011A: "XResolution",
        0x011B: "YResolution",
        0x011C: "PlanarConfiguration",
        0x0128: "ResolutionUnit",
        0x0201: "JpegIFOffset",    // When image format is JPEG, this value show offset to JPEG data stored.(aka "ThumbnailOffset" or "JPEGInterchangeFormat")
        0x0202: "JpegIFByteCount", // When image format is JPEG, this value shows data size of JPEG image (aka "ThumbnailLength" or "JPEGInterchangeFormatLength")
        0x0211: "YCbCrCoefficients",
        0x0212: "YCbCrSubSampling",
        0x0213: "YCbCrPositioning",
        0x0214: "ReferenceBlackWhite"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            var iptcdata = findIPTCinJPEG(binFile);
            var xmpdata= findXMPinJPEG(binFile);
            img.exifdata = data || {};
            img.iptcdata = iptcdata || {};
            img.xmpdata = xmpdata || {};
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function() {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (self.FileReader && (img instanceof self.Blob || img instanceof self.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset+2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function(dataView, offset){
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset+1) === 0x42 &&
                dataView.getUint8(offset+2) === 0x49 &&
                dataView.getUint8(offset+3) === 0x4D &&
                dataView.getUint8(offset+4) === 0x04 &&
                dataView.getUint8(offset+5) === 0x04
            );
        };

        while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset+7);
                if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if(nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78 : 'caption',
        0x6E : 'credit',
        0x19 : 'keywords',
        0x37 : 'dateCreated',
        0x50 : 'byline',
        0x55 : 'bylineTitle',
        0x7A : 'captionWriter',
        0x69 : 'headline',
        0x74 : 'copyright',
        0x0F : 'category'
    };
    function readIPTCData(file, startOffset, sectionLength){
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                segmentType = dataView.getUint8(segmentStartPos+2);
                if(segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos+3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                    // Check if we already stored a value with this name
                    if(data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if(data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    /**
    * Given an IFD (Image File Directory) start offset
    * returns an offset to next IFD or 0 if it's the last IFD.
    */
    function getNextIFDOffset(dataView, dirStart, bigEnd){
        //the first 2bytes means the number of directory entries contains in this IFD
        var entries = dataView.getUint16(dirStart, !bigEnd);

        // After last directory entry, there is a 4bytes of data,
        // it means an offset to next IFD.
        // If its value is '0x00000000', it means this is the last IFD and there is no linked IFD.

        return dataView.getUint32(dirStart + 2 + entries * 12, !bigEnd); // each entry is 12 bytes long
    }

    function readThumbnailImage(dataView, tiffStart, firstIFDOffset, bigEnd){
        // get the IFD1 offset
        var IFD1OffsetPointer = getNextIFDOffset(dataView, tiffStart+firstIFDOffset, bigEnd);

        if (!IFD1OffsetPointer) {
            // console.log('******** IFD1Offset is empty, image thumb not found ********');
            return {};
        }
        else if (IFD1OffsetPointer > dataView.byteLength) { // this should not happen
            // console.log('******** IFD1Offset is outside the bounds of the DataView ********');
            return {};
        }
        // console.log('*******  thumbnail IFD offset (IFD1) is: %s', IFD1OffsetPointer);

        var thumbTags = readTags(dataView, tiffStart, tiffStart + IFD1OffsetPointer, IFD1Tags, bigEnd)

        // EXIF 2.3 specification for JPEG format thumbnail

        // If the value of Compression(0x0103) Tag in IFD1 is '6', thumbnail image format is JPEG.
        // Most of Exif image uses JPEG format for thumbnail. In that case, you can get offset of thumbnail
        // by JpegIFOffset(0x0201) Tag in IFD1, size of thumbnail by JpegIFByteCount(0x0202) Tag.
        // Data format is ordinary JPEG format, starts from 0xFFD8 and ends by 0xFFD9. It seems that
        // JPEG format and 160x120pixels of size are recommended thumbnail format for Exif2.1 or later.

        if (thumbTags['Compression']) {
            // console.log('Thumbnail image found!');

            switch (thumbTags['Compression']) {
                case 6:
                    // console.log('Thumbnail image format is JPEG');
                    if (thumbTags.JpegIFOffset && thumbTags.JpegIFByteCount) {
                    // extract the thumbnail
                        var tOffset = tiffStart + thumbTags.JpegIFOffset;
                        var tLength = thumbTags.JpegIFByteCount;
                        thumbTags['blob'] = new Blob([new Uint8Array(dataView.buffer, tOffset, tLength)], {
                            type: 'image/jpeg'
                        });
                    }
                break;

            case 1:
                console.log("Thumbnail image format is TIFF, which is not implemented.");
                break;
            default:
                console.log("Unknown thumbnail image format '%s'", thumbTags['Compression']);
            }
        }
        else if (thumbTags['PhotometricInterpretation'] == 2) {
            console.log("Thumbnail image format is RGB, which is not implemented.");
        }
        return thumbTags;
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (var n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        // extract thumbnail
        tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd);

        return tags;
    }

   function findXMPinJPEG(file) {

        if (!('DOMParser' in self)) {
            // console.warn('XML parsing not supported without DOMParser');
            return;
        }
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
           if (debug) console.log("Not a valid JPEG");
           return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            dom = new DOMParser();

        while (offset < (length-4)) {
            if (getStringFromDB(dataView, offset, 4) == "http") {
                var startOffset = offset - 1;
                var sectionLength = dataView.getUint16(offset - 2) - 1;
                var xmpString = getStringFromDB(dataView, startOffset, sectionLength)
                var xmpEndIndex = xmpString.indexOf('xmpmeta>') + 8;
                xmpString = xmpString.substring( xmpString.indexOf( '<x:xmpmeta' ), xmpEndIndex );

                var indexOfXmp = xmpString.indexOf('x:xmpmeta') + 10
                //Many custom written programs embed xmp/xml without any namespace. Following are some of them.
                //Without these namespaces, XML is thought to be invalid by parsers
                xmpString = xmpString.slice(0, indexOfXmp)
                            + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" '
                            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                            + 'xmlns:tiff="http://ns.adobe.com/tiff/1.0/" '
                            + 'xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" '
                            + 'xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" '
                            + 'xmlns:exif="http://ns.adobe.com/exif/1.0/" '
                            + 'xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" '
                            + 'xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" '
                            + 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" '
                            + 'xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" '
                            + 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
                            + xmpString.slice(indexOfXmp)

                var domDocument = dom.parseFromString( xmpString, 'text/xml' );
                return xml2Object(domDocument);
            } else{
             offset++;
            }
        }
    }

    function xml2Object(xml) {
        try {
            var obj = {};
            if (xml.children.length > 0) {
              for (var i = 0; i < xml.children.length; i++) {
                var item = xml.children.item(i);
                var attributes = item.attributes;
                for(var idx in attributes) {
                    var itemAtt = attributes[idx];
                    var dataKey = itemAtt.nodeName;
                    var dataValue = itemAtt.nodeValue;

                    if(dataKey !== undefined) {
                        obj[dataKey] = dataValue;
                    }
                }
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                  obj[nodeName] = xml2json(item);
                } else {
                  if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];

                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                  }
                  obj[nodeName].push(xml2json(item));
                }
              }
            } else {
              obj = xml.textContent;
            }
            return obj;
          } catch (e) {
              console.log(e.message);
          }
    }

    EXIF.getData = function(img, callback) {
        if (((self.Image && img instanceof self.Image)
            || (self.HTMLImageElement && img instanceof self.HTMLImageElement))
            && !img.complete)
            return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }
    
    EXIF.getIptcTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.iptcdata[tag];
    }

    EXIF.getAllTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }
    
    EXIF.getAllIptcTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.iptcdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function(file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function() {
            return EXIF;
        });
    }
}.call(this));

(function (Alvin) {
	if (!Alvin.MBC)
		Alvin.MBC = {};

	var lib = Alvin.MBC.Lib = {};

	lib.getElDimensions = function (el) {
		var displayFormat, elDimensions;

		if (!el) return false;

		displayFormat = el.style.display;

		el.style.display = '';

		elDimensions = 
		{
			clientTop: el.clientTop, 
			clientLeft: el.clientLeft,
			clientWidth: el.clientWidth ? el.clientWidth : (parseInt(el.style.width) ? parseInt(el.style.width) : 0),
			clientHeight: el.clientHeight ? el.clientHeight : (parseInt(el.style.height) ? parseInt(el.style.height) : 0)
		};

		el.style.display = displayFormat;

		return elDimensions;
	}

	lib.hasClass = function(obj,cls) {  
		return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
	};  

	lib.addClass = function(obj,cls) {  
		if (!this.hasClass(obj,cls)) obj.className += cls;  
	}  

	lib.removeClass = function(obj,cls) {  
		if (this.hasClass(obj,cls)) {  
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
			obj.className = obj.className.replace(reg, ' ');  
		}  
	}; 

	lib.toggleClass = function(obj,cls){  
	    if(this.hasClass(obj,cls)){  
	        this.removeClass(obj,cls);  
	    }else{  
	        this.addClass(obj,cls);  
	    }  
	};

	lib.isNumber = function (val) {
		if(val === "" || val ==null){
			return false;
		}
		if(!isNaN(val)){
			return true;
		}else{
			return false;
		}
	}

	lib.each = function (object, fn, context) {
        if (object) {
            var key,
                val,
                keys,
                i = 0,
                length = object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                isObj = lib.isUndefined(length) || lib.isFunction(object);

            context = context || null;

            if (isObj) {
                keys = lib.keys(object);
                for (; i < keys.length; i++) {
                    key = keys[i];
                    // can not use hasOwnProperty
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                    i < length; val = object[++i]) {
                    if (fn.call(context, val, i, object) === false) {
                        break;
                    }
                }
            }
        }

        return object;
	};

	lib.isUndefined = function (exp) {
		if (typeof(exp) == "undefined")
		{
			return true;
		}
		return false;
	};
	
	lib.isFunction = function (_fun) {
		return _fun && typeof (_fun) === 'function';
	};

	var hasEnumBug = !({ toString: 1 }.propertyIsEnumerable('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];
		
    function hasOwnProperty(o, p) {
        return ({}).hasOwnProperty.call(o, p);
	}
	
	lib.keys = Object.keys || function(o) {
        var result = [], p, i;

        for (p in o) {
            // lib.keys(new XX())
            if (hasOwnProperty(o, p)) {
                result.push(p);
            }
        }

        if (hasEnumBug) {
            for (i = enumProperties.length - 1; i >= 0; i--) {
                p = enumProperties[i];
                if (hasOwnProperty(o, p)) {
                    result.push(p);
                }
            }
        }

        return result;
	};

	lib.doCallbackNoBreak = function(callback, paras){
		if(callback){
			try{
				callback.apply(window, paras||[]);
			}
			catch(ex){
				setTimeout(function(){throw(ex);},0);
			}
		}
	};

	lib.convertBase64ToBlob = function(base64Str, mimeType){
	var byteCharacters = window.atob(base64Str);
	var byteNumArr = new Array(byteCharacters.length);
	for(var i=0; i < byteCharacters.length; ++i){
		byteNumArr[i] = byteCharacters.charCodeAt(i);
	}
	var uint8Arr = new Uint8Array(byteNumArr);
	return new Blob([uint8Arr], {type: mimeType});
	};

	lib.convertURLToBlob = function(url, callback) {
	var http = new XMLHttpRequest();
	http.open("GET", url, true);
	http.responseType = "blob";
	http.onloadend = function() {
		callback(this.response);
	};
	http.send();
	};

	lib.canvasToBlob = function(cvs, callback, mimeType, quality){
	if(cvs.toBlob){
		cvs.toBlob(callback, mimeType, quality);
	}else{
		var b64str = cvs.toDataURL(mimeType, quality);
		var blob = lib.convertBase64ToBlob(b64str.substring(b64str.indexOf(",")+1), mimeType);
		callback(blob);
	}
	};

	lib.getBlobFromAnyImgData = function(imgData, callback){
	if(imgData instanceof Blob){
		callback(imgData);
	}else if(imgData instanceof HTMLCanvasElement){
		lib.canvasToBlob(imgData, function(blob){
			callback(blob);
		});
	}else if(typeof imgData == "string" || imgData instanceof String){
		var url = imgData;
		if("data:" == url.substring(0, 5)){ // url is base64
			var mimeType = "";
			if("image/" == url.substring(5, 11)){
				mimeType = url.substring(5, url.indexOf(";", 11));
			}
			var blob = lib.convertBase64ToBlob(url.substring(url.indexOf("base64,")+7), mimeType);
			callback(blob);
		}else{ // url is link, such as 'https://....'
			lib.convertURLToBlob(url, function(blob){
				callback(blob);
			});
		}
	}else if(imgData instanceof HTMLImageElement){
		var src;
		//src maybe access denied
		try{
			src = imgData.src;
		}catch(ex){
			setTimeout(function(){
				throw(ex);
			},0);
			callback(null, '');
			return;
		}

		// url not available, maybe network problem
		// use imgData -> canvas -> blob instand 
		var tCvs = document.createElement('canvas');
		tCvs.width = imgData.naturalWidth;
		tCvs.height = imgData.naturalHeight;
		var ctx = tCvs.getContext('2d');
		ctx.drawImage(imgData, 0, 0);

		// use suffix guess image mime type
		var suffix = "";
		var questionPos = src.lastIndexOf("?");
		var dotPos = -1;
		if(-1 != questionPos){
			dotPos = src.lastIndexOf(".", questionPos);
			if(-1 != dotPos && questionPos - dotPos <= 5){ //max supported type suffix is 4
				suffix = src.substring(dotPos + 1, questionPos);
			}
		}else{
			dotPos = src.lastIndexOf(".");
			if(-1 != dotPos){
				if(src.length - dotPos <= 5){ //max supported type suffix is 4
					suffix = src.substring(dotPos + 1);
				}else{
					suffix = src.substring(dotPos + 1, dotPos + 5);
				}
			}
		}
		var saveFormat;
		if(-1 != suffix.indexOf("webp")){
			saveFormat = "image/webp";
		}else if(-1 != suffix.indexOf("png") || -1 != suffix.indexOf("gif") || -1 != suffix.indexOf("svg")){
			saveFormat = "image/png";
		}else{ // like jpeg
			saveFormat = "image/jpeg";
		}

		lib.canvasToBlob(tCvs, function(blob){
			callback(blob);
		}, saveFormat);    

	}else{
		//not support
		callback(null);
	}

	};

	lib.addEvent = function(obj,type,handle){
		var typeAry = type.split(' ');
		if(!obj.length){
			for(var j=0;j<typeAry.length;j++){
				obj.addEventListener ? obj.addEventListener(typeAry[j],handle,false) : obj.attachEvent("on"+typeAry[j],handle);
			}
		}else{
			for(var i=0;i<obj.length;i++){
				for(var j=0;j<typeAry.length;j++){
					obj[i].addEventListener ? obj[i].addEventListener(typeAry[j],handle,false) : obj[i].attachEvent("on"+typeAry[j],handle);
				}
			}
		}
	};

	lib.removeEvent = function(obj,type,handle){
		var typeAry = type.split(' ');
		if(!obj.length){
			for(var j=0;j<typeAry.length;j++){
				obj.removeEventListener ? obj.removeEventListener(typeAry[j],handle,false) : obj.detachEvent("on"+typeAry[j],handle);
			}
		}else{
			for(var i=0;i<obj.length;i++){
				for(var j=0;j<typeAry.length;j++){
					obj[i].removeEventListener ? obj[i].removeEventListener(typeAry[j],handle,false) : obj[i].detachEvent("on"+typeAry[j],handle);
				}
			}
		}
	};

	lib.stopDefault = function(e){
		if ( e && e.preventDefault ){ 
			e.preventDefault();
		} else { 
			window.event.returnValue = false;
		}
	};

	lib._querySelectorAll = function(element, selector){
		var idAllocator = 10000;
		if (element.querySelectorAll){
			return element.querySelectorAll(selector);
		}else {
			var needsID = element.id === "";
			if (needsID) {
				++idAllocator;
				element.id = "__qsa" + idAllocator;
			}
			try {
				return document.querySelectorAll("#" + element.id + " " + selector);
			}
			finally {
				if (needsID) {
					element.id = "";
				}
			}
		}
	};

	lib.fireEvent = function (name, el) {
		var event;
		if (document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent(name, true, true);

			if (el.dispatchEvent)
				el.dispatchEvent(event);
		}
		else if (document.createEventObject) {
			event = document.createEventObject();
			event.bubbles = true;
			event.cancelable = true;
			el.fireEvent(name, event);
		}
		else {
			event = new Event(name);
			if (el.dispatchEvent)
				el.dispatchEvent(event);
		}
	}

	//indexOf() do not compatible with IE6-8
	if(!Array.prototype.indexOf){  
		Array.prototype.indexOf = function(val){  
			var value = this;  
			for(var i =0; i < value.length; i++){  
				if(value[i] == val) return i;  
			}  
			return -1;  
		};  
	}

	// querySelector & querySelectorAll do not compatible with IE6-7
	if (!document.querySelectorAll) {
		document.querySelectorAll = function (selectors) {
			var style = document.createElement('style'), elements = [], element;
			document.documentElement.firstChild.appendChild(style);
			document._qsa = [];

			style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
			window.scrollBy(0, 0);
			style.parentNode.removeChild(style);

			while (document._qsa.length) {
				element = document._qsa.shift();
				element.style.removeAttribute('x-qsa');
				elements.push(element);
			}
			document._qsa = null;
			return elements;
		};
	}

	if (!document.querySelector) {
		document.querySelector = function (selectors) {
			var elements = document.querySelectorAll(selectors);
			return (elements.length) ? elements[0] : null;
		};
	}

	lib.mix = function (dest, source) {
		for (var i in source) {
			if (source.hasOwnProperty(i)) {
				dest[i] = source[i];
			}
		}
		return dest;
	}

	// global errors
	lib.Errors = {
		Sucess: function (obj) {
			obj._errorCode = 0;
			obj._errorString = 'Successful.';
		},
		IndexOutOfRange: function (obj) {
			obj._errorCode = -1000;
			obj._errorString = 'The index is out of range.';
		},
		FucNotValidInThisMode: function (obj,fuc,mode) {
			obj._errorCode = -1001;
			obj._errorString = ''+fuc+'(): This function is not valid in '+mode+' mode.';
		},
		InvalidValue: function (obj) {
			obj._errorCode = -1002;
			obj._errorString = 'Invalid value.';
		},
		InvalidParameterType: function (obj) {
			obj._errorCode = -1003;
			obj._errorString = 'Parameter type is not supported.';
		},

		__last: false
	}

	lib.DEF = function (self, name, obj){
		Object.defineProperty(self, name, obj);
	}

	lib.attachProperty = function (st) {
		var _this = st;
		var DEF = lib.DEF;

		DEF(_this, 'ErrorCode', {
			get: function () {// read-only
				return _this._errorCode;
			}
		});
		DEF(_this, 'ErrorString', {
			get: function () {// read-only
				if (_this._errorCode != 0) {
					return _this._errorString;
				}

				return 'Successful.';
			}
		});
		DEF(_this, 'HowManyImagesInBuffer', {
			get: function () {
				return _this.GetCount();
			}
		});
		DEF(_this, 'CurrentImageIndexInBuffer', {
			get: function () {
				return _this.GetCurentIndex();
			},
			set: function (v) {
				var _v = v * 1;

				if (_v >= 0 && _v < _this.GetCount()) {
					_this.ShowImage(_v);
				}
				return true;
			}
		});
	}

})(Alvin);/**
 * MIT https://github.com/lahmatiy/es6-promise-polyfill
*/
(function(global){

//
// Check for native Promise and it has correct interface
//

var NativePromise = global['Promise'];
var nativePromiseSupported =
  NativePromise &&
  // Some of these methods are missing from
  // Firefox/Chrome experimental implementations
  'resolve' in NativePromise &&
  'reject' in NativePromise &&
  'all' in NativePromise &&
  'race' in NativePromise &&
  // Older version of the spec had a resolver object
  // as the arg rather than a function
  (function(){
    var resolve;
    new NativePromise(function(r){ resolve = r; });
    return typeof resolve === 'function';
  })();


//
// export if necessary
//

if (typeof exports !== 'undefined' && exports)
{
  // node.js
  exports.Promise = nativePromiseSupported ? NativePromise : Promise;
  exports.Polyfill = Promise;
}
else
{
  // AMD
  if (typeof define == 'function' && define.amd)
  {
    define(function(){
      return nativePromiseSupported ? NativePromise : Promise;
    });
  }
  else
  {
    // in browser add to global
    if (!nativePromiseSupported)
      global['Promise'] = Promise;
  }
}


//
// Polyfill
//

var PENDING = 'pending';
var SEALED = 'sealed';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';
var NOOP = function(){};

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

// async calls
var asyncSetTimer = typeof setImmediate !== 'undefined' ? setImmediate : setTimeout;
var asyncQueue = [];
var asyncTimer;

function asyncFlush(){
  // run promise callbacks
  for (var i = 0; i < asyncQueue.length; i++)
    asyncQueue[i][0](asyncQueue[i][1]);

  // reset async asyncQueue
  asyncQueue = [];
  asyncTimer = false;
}

function asyncCall(callback, arg){
  asyncQueue.push([callback, arg]);

  if (!asyncTimer)
  {
    asyncTimer = true;
    asyncSetTimer(asyncFlush, 0);
  }
}


function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve(promise, value);
  }

  function rejectPromise(reason) {
    reject(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(subscriber){
  var owner = subscriber.owner;
  var settled = owner.state_;
  var value = owner.data_;  
  var callback = subscriber[settled];
  var promise = subscriber.then;

  if (typeof callback === 'function')
  {
    settled = FULFILLED;
    try {
      value = callback(value);
    } catch(e) {
      reject(promise, e);
    }
  }

  if (!handleThenable(promise, value))
  {
    if (settled === FULFILLED)
      resolve(promise, value);

    if (settled === REJECTED)
      reject(promise, value);
  }
}

function handleThenable(promise, value) {
  var resolved;

  try {
    if (promise === value)
      throw new TypeError('A promises callback cannot return that same promise.');

    if (value && (typeof value === 'function' || typeof value === 'object'))
    {
      var then = value.then;  // then should be retrived only once

      if (typeof then === 'function')
      {
        then.call(value, function(val){
          if (!resolved)
          {
            resolved = true;

            if (value !== val)
              resolve(promise, val);
            else
              fulfill(promise, val);
          }
        }, function(reason){
          if (!resolved)
          {
            resolved = true;

            reject(promise, reason);
          }
        });

        return true;
      }
    }
  } catch (e) {
    if (!resolved)
      reject(promise, e);

    return true;
  }

  return false;
}

function resolve(promise, value){
  if (promise === value || !handleThenable(promise, value))
    fulfill(promise, value);
}

function fulfill(promise, value){
  if (promise.state_ === PENDING)
  {
    promise.state_ = SEALED;
    promise.data_ = value;

    asyncCall(publishFulfillment, promise);
  }
}

function reject(promise, reason){
  if (promise.state_ === PENDING)
  {
    promise.state_ = SEALED;
    promise.data_ = reason;

    asyncCall(publishRejection, promise);
  }
}

function publish(promise) {
  var callbacks = promise.then_;
  promise.then_ = undefined;

  for (var i = 0; i < callbacks.length; i++) {
    invokeCallback(callbacks[i]);
  }
}

function publishFulfillment(promise){
  promise.state_ = FULFILLED;
  publish(promise);
}

function publishRejection(promise){
  promise.state_ = REJECTED;
  publish(promise);
}

/**
* @class
*/
function Promise(resolver){
  if (typeof resolver !== 'function')
    throw new TypeError('Promise constructor takes a function argument');

  if (this instanceof Promise === false)
    throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');

  this.then_ = [];

  invokeResolver(resolver, this);
}

Promise.prototype = {
  constructor: Promise,

  state_: PENDING,
  then_: null,
  data_: undefined,

  then: function(onFulfillment, onRejection){
    var subscriber = {
      owner: this,
      then: new this.constructor(NOOP),
      fulfilled: onFulfillment,
      rejected: onRejection
    };

    if (this.state_ === FULFILLED || this.state_ === REJECTED)
    {
      // already resolved, call callback async
      asyncCall(invokeCallback, subscriber);
    }
    else
    {
      // subscribe
      this.then_.push(subscriber);
    }

    return subscriber.then;
  },

  'catch': function(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise.all = function(promises){
  var Class = this;

  if (!isArray(promises))
    throw new TypeError('You must pass an array to Promise.all().');

  return new Class(function(resolve, reject){
    var results = [];
    var remaining = 0;

    function resolver(index){
      remaining++;
      return function(value){
        results[index] = value;
        if (!--remaining)
          resolve(results);
      };
    }

    for (var i = 0, promise; i < promises.length; i++)
    {
      promise = promises[i];

      if (promise && typeof promise.then === 'function')
        promise.then(resolver(i), reject);
      else
        results[i] = promise;
    }

    if (!remaining)
      resolve(results);
  });
};

Promise.race = function(promises){
  var Class = this;

  if (!isArray(promises))
    throw new TypeError('You must pass an array to Promise.race().');

  return new Class(function(resolve, reject) {
    for (var i = 0, promise; i < promises.length; i++)
    {
      promise = promises[i];

      if (promise && typeof promise.then === 'function')
        promise.then(resolve, reject);
      else
        resolve(promise);
    }
  });
};

Promise.resolve = function(value){
  var Class = this;

  if (value && typeof value === 'object' && value.constructor === Class)
    return value;

  return new Class(function(resolve){
    resolve(value);
  });
};

Promise.reject = function(reason){
  var Class = this;

  return new Class(function(resolve, reject){
    reject(reason);
  });
};

})(typeof window != 'undefined' ? window : typeof global != 'undefined' ? global : typeof self != 'undefined' ? self : this);
/*
 * master branch: https://github.com/Keillion/www.keillion.site Unlicense
 */
/*global jQuery*/
var kUtil = kUtil || {};
if(!Math.sign){
    Math.sign = function(num){
        if(num > 0){
            return 1;
        }else if(num == 0){
            if(1 / num < 0){
                return -0;
            }else{
                return 0;
            }
        }else if(num < 0){
            return -1;
        }else{
            return NaN;
        }
    };
}
kUtil.Matrix = function(a,b,c,d,e,f){
    this.a=a,
    this.b=b,
    this.c=c,
    this.d=d,
    this.e=e,
    this.f=f;
};
kUtil.Matrix.dot = function(matrixA, matrixB){
    var A=matrixA, B=matrixB;
    return new kUtil.Matrix(
        A.a*B.a+A.c*B.b,
        A.b*B.a+A.d*B.b,
        A.a*B.c+A.c*B.d,
        A.b*B.c+A.d*B.d,
        A.a*B.e+A.c*B.f+A.e,
        A.b*B.e+A.d*B.f+A.f
    );
};
kUtil.Matrix.prototype.dot = function(matrix){
    return kUtil.Matrix.dot(this, matrix);
};
kUtil.Matrix.equals = function(matrixA, matrixB){
    var A=matrixA, B=matrixB;
    return A.a==B.a && A.b==B.b && A.c==B.c && A.d==B.d && A.e==B.e && A.f==B.f;
};
kUtil.Matrix.prototype.equals = function(matrix){
    return kUtil.Matrix.equals(this, matrix);
};
kUtil.Matrix.prototype.inversion = function(){
    var a=this.a, b=this.b, c=this.c, d=this.d, e=this.e, f=this.f;
    var M = a*d - b*c;
    return new kUtil.Matrix(
        d/M,
        -b/M,
        -c/M,
        a/M,
        (c*f - d*e)/M,
        (b*e - a*f)/M
    );
};
kUtil.convertURLToBlob = function(url, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.responseType = "blob";
    http.onloadend = function() {
        callback(this.response);
    };
    http.send();
};
kUtil.convertBase64ToBlob = function(base64Str, mimeType){
    var byteCharacters = atob(base64Str);
    var byteNumArr = new Array(byteCharacters.length);
    for(var i=0; i < byteCharacters.length; ++i){
        byteNumArr[i] = byteCharacters.charCodeAt(i);
    }
    var uint8Arr = new Uint8Array(byteNumArr);
    return new Blob([uint8Arr], {type: mimeType});
};
/**
 * author: meizz; modify: Keillion
 * https://blog.csdn.net/meizz/article/details/405708
 * */
Date.prototype.kUtilFormat = function(fmt){
    var o = {
        "M+" : this.getUTCMonth()+1,
        "d+" : this.getUTCDate(),
        "h+" : this.getUTCHours(),
        "m+" : this.getUTCMinutes(),
        "s+" : this.getUTCSeconds(),
        "q+" : Math.floor((this.getUTCMonth()+3)/3),
        "S"  : this.getUTCMilliseconds()
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};
kUtil.copyToClipBoard = function(txt){
    if(navigator.clipboard){
        navigator.clipboard.writeText(txt)['catch'](function(ex){
            alert('copy failed, info: '+(ex.message || ex));
        });
    }else{
        var textarea = document.createElement('textarea');
        textarea.style.width = '4px';
        textarea.style.height = '4px';
        textarea.style.position = 'fixed';
        textarea.style.left = '0';
        textarea.style.top = '0';
        jQuery(document.body).append(textarea);
        textarea.value = txt;
        var isIOS = navigator.userAgent.match(/ipad|iphone/i);
        if(isIOS){
            //ios
            var range = document.createRange();
            range.selectNodeContents(textarea);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textarea.setSelectionRange(0, 999999);
        }else{
            //other
            textarea.focus();
            textarea.select();
        }
        try{
            var bSuccess = document.execCommand('copy');//ios would not return true
            if(!bSuccess && !isIOS){
                alert('copy failed');
            }
        }catch(ex){
            alert('copy failed, info: '+(ex.message || ex));
        }
        jQuery(textarea).remove();
    }
};
(function($){
    $.fn.borderWidth = function(){
        var cs = null;
        if(window.getComputedStyle){
            cs = getComputedStyle(this[0]);
        }else{
            cs = this[0].currentStyle;
        }
        var info = {};
        info.left = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("border-left-width") : cs.getAttribute("border-left-width")) || 0;
        info.top = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("border-top-width") : cs.getAttribute("border-top-width")) || 0;
        info.right = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("border-right-width") : cs.getAttribute("border-right-width")) || 0;
        info.bottom = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("border-bottom-width") : cs.getAttribute("border-bottom-width")) || 0;
        return info;
    };
    $.fn.padding = function(){
        var cs = null;
        if(window.getComputedStyle){
            cs = getComputedStyle(this[0]);
        }else{
            cs = this[0].currentStyle;
        }
        var info = {};
        info.left = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("padding-left") : cs.getAttribute("padding-left")) || 0;
        info.top = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("padding-top") : cs.getAttribute("padding-top")) || 0;
        info.right = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("padding-right") : cs.getAttribute("padding-right")) || 0;
        info.bottom = parseFloat(cs.getPropertyValue ? cs.getPropertyValue("padding-bottom") : cs.getAttribute("padding-bottom")) || 0;
        return info;
    };
    $.fn.borderBoxRect = function(){
        var cs = null;
        if(window.getComputedStyle){
            cs = getComputedStyle(this[0]);
        }
        var offset = this.offset();
        var info = {};
        /*info.zoom = 1;
         tudo:matrix
        var strTransform = this.css('transform');
        if('none'!=strTransform){
            var partStr = 'matrix(';
            var matrixIndex = strTransform.indexOf(partStr) + partStr.length;
            if(-1 != matrixIndex){
                var matrixArr = strTransform.substring(matrixIndex, strTransform.indexOf(')', matrixIndex)).split(',');
                info.zoom = parseFloat(matrixArr[0]);
            }
        }*/
        info.pageX0 = offset.left;
        info.pageY0 = offset.top;
        info.width = cs?parseFloat(cs.width):this.outerWidth();//*info.zoom;
        info.height = cs?parseFloat(cs.height):this.outerHeight();//*info.zoom;
        info.pageX1 = info.pageX0 + info.width;
        info.pageY1 = info.pageY0 + info.height;
        //tudo: client\screen
        return info;
    };
    $.fn.paddingBoxRect = function(){
        var borderBoxRect = this.borderBoxRect();
        var borderWidth = this.borderWidth();
        var info = {};
        //info.zoom = borderBoxRect.zoom;
        info.pageX0 = borderBoxRect.pageX0 + borderWidth.left;//*info.zoom;
        info.pageY0 = borderBoxRect.pageY0 + borderWidth.top;//*info.zoom;
        info.width = window.getComputedStyle?borderBoxRect.width - (borderWidth.left + borderWidth.right):this.innerWidth();//*info.zoom;
        info.height = window.getComputedStyle?borderBoxRect.height - (borderWidth.top + borderWidth.bottom):this.innerHeight();//*info.zoom;
        info.pageX1 = borderBoxRect.pageX1 - borderWidth.right;//*info.zoom;
        info.pageY1 = borderBoxRect.pageY1 - borderWidth.bottom;//*info.zoom;
        //tudo: client\screen
        return info;
    };
    $.fn.contentBoxRect = function(){
        var paddingBoxRect = this.paddingBoxRect();
        var padding = this.padding();
        var info = {};
        //info.zoom = paddingBoxRect.zoom;
        info.pageX0 = paddingBoxRect.pageX0 + padding.left;//*info.zoom;
        info.pageY0 = paddingBoxRect.pageY0 + padding.top;//*info.zoom;
        info.width = window.getComputedStyle?paddingBoxRect.width - (padding.left + padding.right):this.width();//*info.zoom;
        info.height = window.getComputedStyle?paddingBoxRect.height - (padding.top + padding.bottom):this.height();//*info.zoom;
        info.pageX1 = paddingBoxRect.pageX1 - padding.right;//*info.zoom;
        info.pageY1 = paddingBoxRect.pageY1 - padding.bottom;//*info.zoom;
        //tudo: client\screen
        return info;
    };
    $.fn.getTransform = function(){
        var strTransform = this.css('transform');
        if('none' == strTransform || '' == strTransform){
            //jq bug, transform might not get latest, I only resolve the situation when set matrix(...)
            strTransform = this[0].style.transform;
        }
        var partStr = 'matrix(';
        var matrixIndex = strTransform.indexOf(partStr);
        if(-1 != matrixIndex){
            matrixIndex += partStr.length;
            var arr = strTransform.substring(matrixIndex, strTransform.indexOf(')', matrixIndex)).split(',');
            for(var i=0; i<arr.length; ++i){
                arr[i] = parseFloat(arr[i]);
            }
            return new kUtil.Matrix(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5]);//.apply(kUtil.Matrix, matrixArr);
        }
        partStr = 'scale(';
        var scaleIndex = strTransform.indexOf(partStr);
        if(-1 != scaleIndex){
            scaleIndex += partStr.length;
            var zoom = parseFloat(strTransform.substring(scaleIndex));
            return new kUtil.Matrix(zoom,0,0,zoom,0,0);
        }
        return new kUtil.Matrix(1,0,0,1,0,0);
    };
    $.fn.setTransform = function(matrix){
        var m = matrix;
        var str = 'matrix('+[m.a,m.b,m.c,m.d,m.e,m.f].join(',')+')';
        this.css('transform', str);
    };
})(jQuery);
(function (DL,MBC) {
    "use strict";
    var lib = DL;   
    function VideoViewer(cfg){
        var _this = this;
        _this.videoHtmlElement = [
            '<div class="kPainterVideoMdl">',
                '<video class="kPainterVideo" webkit-playsinline="true"></video>',
                '<select class="kPainterCameraSelect">',
                '</select>',
                '<select class="kPainterResolutionSelect">',
                    '<option class="kPainterGotResolutionOpt" value="got" selected></option>',
                    '<option data-width="3840" data-height="2160">ask 3840 x 2160</option>',
                    '<option data-width="1920" data-height="1080">ask 1920 x 1080</option>',
                    '<option data-width="1600" data-height="1200">ask 1600 x 1200</option>',
                    '<option data-width="1280" data-height="720">ask 1280 x 720</option>',
                    '<option data-width="800" data-height="600">ask 800 x 600</option>',
                    '<option data-width="640" data-height="480">ask 640 x 480</option>',
                    '<option data-width="640" data-height="360">ask 640 x 360</option>',
                '</select>',
                '<button class="kPainterBtnGrabVideo"><svg width="48" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1024 672q119 0 203.5 84.5t84.5 203.5-84.5 203.5-203.5 84.5-203.5-84.5-84.5-203.5 84.5-203.5 203.5-84.5zm704-416q106 0 181 75t75 181v896q0 106-75 181t-181 75h-1408q-106 0-181-75t-75-181v-896q0-106 75-181t181-75h224l51-136q19-49 69.5-84.5t103.5-35.5h512q53 0 103.5 35.5t69.5 84.5l51 136h224zm-704 1152q185 0 316.5-131.5t131.5-316.5-131.5-316.5-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5z"/></svg></button>',
                '<button class="kPainterBtnCloseVideo"><svg width="48" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/></svg></button>',
            '</div>'
        ].join('');

        _this.videoSettings = cfg.videoSettings;
        _this.viewer = cfg.viewer;
        _this.beforeAddImgFromGrabVideoBtn = null;
        _this.afterAddImgFromGrabVideoBtn = null;

        // video 是否关闭
        _this.videoClosed = true;
    }

    VideoViewer.prototype.__Init = function(){
        var _this = this;

        _this.videoWrapper = document.getElementById("videoWrapper");
        _this.video = lib._querySelectorAll(_this.videoWrapper,'.kPainterVideo')[0];
        _this.cameraSel = lib._querySelectorAll(_this.videoWrapper,'.kPainterCameraSelect')[0];
        _this.resolutionSel = lib._querySelectorAll(_this.videoWrapper,'.kPainterResolutionSelect')[0];
        _this.optGotRsl = lib._querySelectorAll(_this.videoWrapper,'.kPainterGotResolutionOpt')[0];
        _this.btnGrab = lib._querySelectorAll(_this.videoWrapper,'.kPainterBtnGrabVideo')[0];
        _this.btnClose = lib._querySelectorAll(_this.videoWrapper,'.kPainterBtnCloseVideo')[0];

        function camSelChange(){
            _this.playVideo(_this.cameraSel.value).then(function(){
                if(!_this.videoClosed){
                    _this.stopVideo();
                }
            }).catch(function(ex){
                alert('Play video failed: ' + (ex.message || ex));
            });
        };
        if(_this.cameraSel) lib.addEvent(_this.cameraSel,"change", camSelChange);

        function relSelChange(){
            _this.playVideo().then(function(){
                if(!_this.videoClosed){
                    _this.stopVideo();
                }
            }).catch(function(ex){
                alert('Play video failed: ' + (ex.message || ex));
            });
            return true;
        };
        if(_this.resolutionSel) lib.addEvent(_this.resolutionSel,"change", relSelChange);
        
        function btnGrabClick(){
            _this.grabVideo(true);
            _this.hideVideo();
            return true;
        };
        if(_this.btnGrab) lib.addEvent(_this.btnGrab,"click", btnGrabClick);

        function closeWindow(){
            _this.stopVideo();
            _this.videoClosed = true;
            _this.optGotRsl.removeAttribute('data-width');
            
            if(_this.cameraSel) lib.removeEvent(_this.cameraSel,"change", camSelChange);
            if(_this.resolutionSel) lib.removeEvent(_this.resolutionSel,"change", relSelChange);
            if(_this.btnGrab) lib.removeEvent(_this.btnGrab,"click", btnGrabClick);
            if(_this.btnClose) lib.removeEvent(_this.btnClose,"click", closeWindow);

            document.body.removeChild(_this.videoWrapper);
        };

        _this.hideVideo = closeWindow;
        if(_this.btnClose) lib.addEvent(_this.btnClose,"click", closeWindow);
        
    }

    VideoViewer.prototype.updateDevice = function(){
        var _this = this;
        if(!_this.cameraSel){
            return Promise.reject('no camera select');
        }
        return navigator.mediaDevices.enumerateDevices().then(deviceInfos=>{
            var oldVal = _this.cameraSel.value;
            _this.cameraSel.innerHTML = "";
            var selOpt = undefined;
            window.console.log(deviceInfos,"deviceInfos")
            for(var i = 0; i < deviceInfos.length; ++i){
                var info = deviceInfos[i];
                if(info.kind != 'videoinput'){
                    continue;
                }
                var opt = document.createElement('option');
                opt.value = info.deviceId;
                opt.innerText = info.label || 'camera '+ i;
                _this.cameraSel.appendChild(opt);
                if(oldVal == info.deviceId){
                    selOpt = opt;
                }
            }
            var optArr = _this.cameraSel.childNodes;
            if(!selOpt && optArr.length){
                try{
                    _this.video.srcObject.getTracks().forEach((track)=>{
                        if('video' == track.kind){
                            for(var i = 0; i < optArr.length; ++i){
                                var opt = optArr[i];
                                if(track.label == opt.innerText){
                                    selOpt = opt;
                                    throw 'found the using source';
                                }
                            }
                        }
                    });
                }catch(ex){
                    //if(self.kConsoleLog){self.kConsoleLog(ex);}
                    console.log(ex);
                }
            }
            if(selOpt){
                _this.cameraSel.value = selOpt.value;
            }
        });
    }

    VideoViewer.prototype.stopVideo = function(){
        var _this = this;
        if(_this.video.srcObject){
            //if(self.kConsoleLog)self.kConsoleLog('======stop video========');
            _this.video.srcObject.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        return true;
    }

    VideoViewer.prototype.playVideo = function(deviceId){
        var _this = this;
        return new Promise((resolve,reject)=>{

            _this.stopVideo();

            //if(self.kConsoleLog)self.kConsoleLog('======before video========');
            var constraints = _this.videoSettings ? _this.videoSettings : _this.viewer.videoSettings;
            var selRslOpt = _this.resolutionSel ? _this.resolutionSel.children[_this.resolutionSel.selectedIndex] : null;
            if(selRslOpt && selRslOpt.hasAttribute('data-width')){
                var selW = selRslOpt.getAttribute('data-width');
                var selH = selRslOpt.getAttribute('data-height');
                _this.optGotRsl.setAttribute('data-width', selW);
                _this.optGotRsl.setAttribute('data-height', selH);
                var bMobileSafari = /Safari/.test(navigator.userAgent) && /iPhone/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                if(bMobileSafari){
                    if(selW >= 1280){
                        constraints.video.width = 1280;
                    }else if(selW >= 640){
                        constraints.video.width = 640;
                    }else if(selW >= 320){
                        constraints.video.width = 320;
                    }
                }else{
                    constraints.video.width = { ideal: selW };
                    constraints.video.height = { ideal: selH };
                }
                if(!deviceId){
                    var selCamOpt = _this.cameraSel.children[_this.cameraSel.selectedIndex];
                    if(selCamOpt){
                        deviceId = selCamOpt.value;
                    }
                }
                if(deviceId){
                    constraints.video.facingMode = undefined;
                    constraints.video.deviceId = {exact: deviceId};
                }
            }
            
            var hasTryedNoWidthHeight = false;
            var getAndPlayVideo = ()=>{
                //if(self.kConsoleLog)self.kConsoleLog('======try getUserMedia========');
                //if(self.kConsoleLog)self.kConsoleLog('ask '+JSON.stringify(constraints.video.width)+'x'+JSON.stringify(constraints.video.height));
                navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
                    //if(self.kConsoleLog)self.kConsoleLog('======get video========');
                    return new Promise((resolve2, reject2)=>{
                        _this.video.srcObject = stream;
                        _this.video.onloadedmetadata = ()=>{
                            //if(self.kConsoleLog)self.kConsoleLog('======play video========');
                            _this.video.play().then(()=>{
                            // if(self.kConsoleLog)self.kConsoleLog('======played video========');
                                var gotRsl = _this.video.videoWidth+'x'+_this.video.videoHeight;
                                if(_this.optGotRsl)_this.optGotRsl.innerText = gotRsl;
                                if(_this.resolutionSel)_this.resolutionSel.value = 'got';
                                //if(self.kConsoleLog)self.kConsoleLog(gotRsl);
                                resolve2();
                            },(ex)=>{
                                reject2(ex);
                            });
                        };
                        _this.video.onerror = ()=>{reject2();};
                    });
                }).then(()=>{
                    resolve();
                }).catch((ex)=>{
                    //if(self.kConsoleLog)self.kConsoleLog(ex);
                    if(!hasTryedNoWidthHeight){
                        hasTryedNoWidthHeight = true;
                        constraints.video.width = undefined;
                        constraints.video.height = undefined;
                        getAndPlayVideo();
                    }else{
                        reject(ex);
                    }
                });
            };
            getAndPlayVideo();
        });
    }

    VideoViewer.prototype.grabVideo = function(isAutoAdd){
        var _this = this;
        if(_this.videoClosed) return;

        var canvas = document.createElement("canvas");
        canvas.width = _this.video.videoWidth;
        canvas.height = _this.video.videoHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(_this.video,0,0);
        if(!isAutoAdd){
            return canvas;
        }
        return _this.viewer.LoadImageEx(canvas);
    }

    VideoViewer.prototype.showVideo = function(){
        var _this = this;

        if(!_this.videoClosed) return;

        _this.videoClosed = false;

        var videoWrp = document.createElement("div");
        videoWrp.setAttribute("id","videoWrapper");
        videoWrp.innerHTML = _this.videoHtmlElement;
        document.body.appendChild(videoWrp);

        _this.__Init();

        return _this.playVideo().then(function(){
            if(_this.videoClosed){
                _this.stopVideo();
                return Promise.reject('Video window has closed.');
            }else{
                _this.updateDevice().catch(function(ex){
                    //if(self.kConsoleLog)kConsoleLog(ex);
                    console.log(ex);
                });
                return Promise.resolve();
            }
        });
    }

    MBC.VideoViewer = VideoViewer;

})(Alvin.MBC.Lib,Alvin.MBC);(function (DL, MBC) {
    "use strict";
    var lib = DL;

    function ImageAreaSelector(cfg) {
        var _this = this;
        var containerDiv = [
            '<div class="kPainterCroper" style="display:none;">',
            '<div class="kPainterCells">',
            '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>',
            '</div',
            '><div class="kPainterBigMover" data-orient="0,0" style="display:none"></div',
            '><div class="kPainterEdges">',
            '<div data-orient="1"></div',
            '><div data-orient="2"></div',
            '><div data-orient="3"></div',
            '><div data-orient="4"></div>',
            '</div',
            '><div class="kPainterCorners">',
            '<div data-orient="5"><i></i></div',
            '><div data-orient="6"><i></i></div',
            '><div data-orient="7"><i></i></div',
            '><div data-orient="8"><i></i></div>',
            '</div>',
            '</div',
            '><div class="kPainterPerspect" style="display:none;">',
            '<canvas class="kPainterPerspectCvs"></canvas',
            '><div class="kPainterPerspectCorner" data-index="0">lt</div',
            '><div class="kPainterPerspectCorner" data-index="1">rt</div',
            '><div class="kPainterPerspectCorner" data-index="2">rb</div',
            '><div class="kPainterPerspectCorner" data-index="3">lb</div>',
            '</div',
            '><div class="kPainterGesturePanel"></div>'
        ].join('');

        _this.viewer = cfg.viewer;
        _this.container = cfg.container;

        _this.container.insertAdjacentHTML('beforeEnd', containerDiv);
        _this.kPainterCroper = lib._querySelectorAll(_this.container, 'div.kPainterCroper')[0];

        _this.kPainterCells = lib._querySelectorAll(_this.container, 'div.kPainterCells > div');

        // 控件的四个顶点
        _this.kPainterCorners = lib._querySelectorAll(_this.container, 'div.kPainterCorners > div');
        // 控件的四条边框
        _this.kPainterEdges = lib._querySelectorAll(_this.container, 'div.kPainterEdges > div');

        _this.bVisible = false;
        _this.isAutoShowCropUI = true;
        _this.isCropRectShowing = false;

        // 是否选中可拖拽的边或点
        _this.dragging = false;

        // 控件的最大宽高
        _this.maxWidth = 0;
        _this.maxHeight = 0;

        // 控件的最小宽高
        _this.minWidth = 50;
        _this.minHeight = 50;

        // 最小的边距
        _this.minTop = 0;
        _this.minLeft = 0;

        // 当前边距信息
        _this.top = 0;
        _this.left = 0;

        // 控件的 UI 属性
        _this.borderColor = 'red';
        _this.backgroundColor = 'rgba(255,0,0,0.2)';

        // 鼠标按下时控件的初始信息
        _this._startPos = {
            targetNode: -1, // 控件当前拖拽的边/角：边 -（1：左，2：上，3：右，4：下），角 - （5：左上，6：右上，7：右下，8：左下）
            startX: 0, // 鼠标落点位置
            startY: 0,
            width: 0, // 开始拖拽是控件的高
            height: 0,
            left: 0, // 开始拖拽是控件的位置
            top: 0
        };

        // 画布实时的裁切信息：相对于伸缩后的图片
        _this.drawArea = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };

        // 实际的裁切信息：相对于原图
        _this.cropArea = null;

        _this.__Init();

    }

    ImageAreaSelector.prototype.__Init = function () {
        var _this = this;

        // 给控件四条边和四个角添加响应点击事件
        for (var i = 0; i < 4; i++) {
            lib.addEvent([_this.kPainterCorners[i], _this.kPainterEdges[i]], "mousedown touchstart", fuc_touchstart);
        }

        function fuc_touchstart(event) {
            var ev = event || window.event;
            lib.stopDefault(ev);

            _this.dragging = true;

            lib.addEvent(_this.container, "mousemove touchmove", fuc_touchmove);
            lib.addEvent(_this.container, "mouseleave mouseup touchend", fuc_touchend);

            var touches = ev.changedTouches;

            var curX, curY;
            if (touches) {
                //Multi-contact is prohibited
                if (touches.length != 1) {
                    return false;
                }
                curX = touches[0].pageX;
                curY = touches[0].pageY;
            } else {
                curX = ev.clientX;
                curY = ev.clientY;
            }
            _this._startPos = {
                targetNode: parseInt(this.getAttribute("data-orient")),
                startX: curX,
                startY: curY,
                width: _this.drawArea.width,
                height: _this.drawArea.height,
                left: _this.drawArea.x,
                top: _this.drawArea.y
            }

        }

        function fuc_touchmove(event) {
            var ev = event || window.event;
            lib.stopDefault(ev);
            if (!_this.dragging) return;
            var touches = ev.changedTouches;
            var sp = _this._startPos;

            if (touches) {
                var _curOffsetX = touches[0].pageX - sp.startX,
                    _curOffsetY = touches[0].pageY - sp.startY;
            } else {
                var _curOffsetX = ev.clientX - sp.startX,
                    _curOffsetY = ev.clientY - sp.startY;
            }

            // 控件的实时位置和大小信息
            var curW, curH, curL, curT;

            switch (sp.targetNode) {
                case 1:
                    // 拖拽 左侧边框
                    curW = (sp.width - _curOffsetX) > (sp.left + sp.width) ? (sp.left + sp.width) : (sp.width - _curOffsetX) < _this.minWidth ? _this.minWidth : (sp.width - _curOffsetX);
                    curH = sp.height;
                    curL = sp.left + sp.width - curW;
                    curT = sp.top;
                    break;
                case 2:
                    // 拖拽 上侧边框
                    curW = sp.width;
                    curH = (sp.height - _curOffsetY) > (sp.top + sp.height) ? (sp.top + sp.height) : (sp.height - _curOffsetY) < _this.minHeight ? _this.minHeight : (sp.height - _curOffsetY);
                    curL = sp.left;
                    curT = sp.top + sp.height - curH;
                    break;
                case 3:
                    // 拖拽 右侧边框
                    curW = (sp.width + _curOffsetX) > (_this.maxWidth - sp.left) ? (_this.maxWidth - sp.left) : (sp.width + _curOffsetX) < _this.minWidth ? _this.minWidth : (sp.width + _curOffsetX);
                    curH = sp.height;
                    curL = sp.left;
                    curT = sp.top;
                    break;
                case 4:
                    // 拖拽 下侧边框
                    curW = sp.width;
                    curH = (sp.height + _curOffsetY) > (_this.maxHeight - sp.top) ? (_this.maxHeight - sp.top) : (sp.height + _curOffsetY) < _this.minHeight ? _this.minHeight : (sp.height + _curOffsetY);
                    curL = sp.left;
                    curT = sp.top;
                    break;
                case 5:
                    // 拖拽 左上顶点
                    curW = (sp.width - _curOffsetX) > (sp.left + sp.width) ? (sp.left + sp.width) : (sp.width - _curOffsetX) < _this.minWidth ? _this.minWidth : (sp.width - _curOffsetX);
                    curH = (sp.height - _curOffsetY) > (sp.top + sp.height) ? (sp.top + sp.height) : (sp.height - _curOffsetY) < _this.minHeight ? _this.minHeight : (sp.height - _curOffsetY);
                    curL = sp.left + sp.width - curW;
                    curT = sp.top + sp.height - curH;
                    break;
                case 6:
                    // 拖拽 右上顶点
                    curW = (sp.width + _curOffsetX) > (_this.maxWidth - sp.left) ? (_this.maxWidth - sp.left) : (sp.width + _curOffsetX) < _this.minWidth ? _this.minWidth : (sp.width + _curOffsetX);
                    curH = (sp.height - _curOffsetY) > (sp.top + sp.height) ? (sp.top + sp.height) : (sp.height - _curOffsetY) < _this.minHeight ? _this.minHeight : (sp.height - _curOffsetY);
                    curL = sp.left;
                    curT = sp.top + sp.height - curH;
                    break;
                case 7:
                    // 拖拽 右下顶点
                    curW = (sp.width + _curOffsetX) > (_this.maxWidth - sp.left) ? (_this.maxWidth - sp.left) : (sp.width + _curOffsetX) < _this.minWidth ? _this.minWidth : (sp.width + _curOffsetX);
                    curH = (sp.height + _curOffsetY) > (_this.maxHeight - sp.top) ? (_this.maxHeight - sp.top) : (sp.height + _curOffsetY) < _this.minHeight ? _this.minHeight : (sp.height + _curOffsetY);
                    curL = sp.left;
                    curT = sp.top;
                    break;
                case 8:
                    // 拖拽 左下顶点
                    curW = (sp.width - _curOffsetX) > (sp.left + sp.width) ? (sp.left + sp.width) : (sp.width - _curOffsetX) < _this.minWidth ? _this.minWidth : (sp.width - _curOffsetX);
                    curH = (sp.height + _curOffsetY) > (_this.maxHeight - sp.top) ? (_this.maxHeight - sp.top) : (sp.height + _curOffsetY) < _this.minHeight ? _this.minHeight : (sp.height + _curOffsetY);
                    curL = sp.left + sp.width - curW;
                    curT = sp.top;
                    break;
                default:
                    return;
            }

            _this.__updateDrawArea(curW, curH, curL, curT);

        }

        function fuc_touchend(event) {
            var ev = event || window.event;
            lib.stopDefault(ev);
            if (!_this.dragging) return;
            _this.dragging = false;

            lib.removeEvent(_this.container, "mousemove touchmove", fuc_touchmove);
            lib.removeEvent(_this.container, "mouseleave mouseup touchend", fuc_touchend);
        }
    }

    ImageAreaSelector.prototype.SetVisible = function (bVisible) {
        var _this = this;
        if (bVisible) {
            _this.bVisible = true;
            _this.kPainterCroper.style.display = '';
        } else {
            _this.bVisible = false;
            _this.kPainterCroper.style.display = 'none';
        }

        return true;
    }

    ImageAreaSelector.prototype.ShowCropRect = function () {
        var _this = this;
        if (_this.viewer.mode != 'edit') return;
        _this.isCropRectShowing = true;
        _this.SetVisible(true);

        if (!_this.viewer.isSwitchedWH) {
            _this.maxWidth = _this.viewer._canvasArea.width;
            _this.maxHeight = _this.viewer._canvasArea.height;
        } else {
            _this.maxWidth = _this.viewer._canvasArea.height;
            _this.maxHeight = _this.viewer._canvasArea.width;
        }
        _this.minLeft = (_this.viewer._imgContainerW - _this.maxWidth) / 2;
        _this.minTop = (_this.viewer._imgContainerH - _this.maxHeight) / 2;

        _this.__updateDrawArea(_this.maxWidth, _this.maxHeight, 0, 0);
        return true;
    }

    ImageAreaSelector.prototype.HideCropRect = function () {
        var _this = this;
        _this.isCropRectShowing = false;
        _this.SetVisible(false);

        return true;
    }

    ImageAreaSelector.prototype.__updateDrawArea = function (w, h, x, y) {
        var _this = this;

        _this.drawArea.width = w;
        _this.drawArea.height = h;
        _this.drawArea.x = x;
        _this.drawArea.y = y;

        _this.__updatePosition(w, h, x + _this.minLeft, y + _this.minTop);
    }

    ImageAreaSelector.prototype.__updatePosition = function (w, h, l, t) {
        var _this = this;
        _this.left = l;
        _this.top = t;

        _this.kPainterCroper.style.width = w + 'px';
        _this.kPainterCroper.style.height = h + 'px';
        _this.kPainterCroper.style.left = _this.left + 'px';
        _this.kPainterCroper.style.top = _this.top + 'px';
        return true;
    }

    ImageAreaSelector.prototype.__getCropArea = function () {
        var _this = this,
            curCropRect,
            _x = _this.drawArea.x / _this.maxWidth,
            _y = _this.drawArea.y / _this.maxHeight,
            _w = _this.drawArea.width / _this.maxWidth,
            _h = _this.drawArea.height / _this.maxHeight;

        curCropRect = {
            x: _x,
            y: _y,
            width: _w,
            height: _h
        }
        _this.cropArea = curCropRect;
        return curCropRect;
    }

    MBC.ImageAreaSelector = ImageAreaSelector;

})(Alvin.MBC.Lib, Alvin.MBC);(function (DL,MBC) {
	"use strict";
	var lib = DL;

	function ImageControl(cfg) {
		var _this = this;

		// ImageControl 容器的宽高
		_this.containerWidth = 0;
		_this.containerHeight = 0;

		// ImageControl 的宽高
		_this.controlWidth = 0;
		_this.controlHeight = 0;

		// ImageControl 的原始宽高
		_this._origImageWidth = -1;
		_this._origImageHeight = -1;

		// ImageControl 里 image 实际占用的宽/高
		_this._width = 0;
		_this._height = 0;

		// ImageControl 位置信息
		_this.Left = 0;
		_this.Top = 0;	

		_this.objImage = false;
		_this.imageUrl = null;

		// ImageControl 在 client 端的索引
		_this.cIndex = -1;

		_this.bVisible = true;

		_this.viewer = null;

		// 初始化 ImageControl
		_this.__init(cfg);
	}

	// 初始化
	ImageControl.prototype.__init = function (cfg) {
		var _this = this;

		_this.viewer = cfg.viewer;
		_this.controlWidth = _this.containerWidth = cfg.imgContainerW;
		_this.controlHeight = _this.containerHeight = cfg.imgContainerH;
		_this.imageUrl = cfg.imageUrl;
		_this.cIndex = cfg.index;

		_this.divOut = document.createElement('div');
		_this.divOut.style.display = 'inline-block';
		_this.divOut.style.position = 'absolute';
		_this.divOut.style.top = _this.Top + 'px';
		_this.divOut.style.left = _this.Left + 'px';
		_this.divOut.style.width = _this.controlWidth + 'px';
		_this.divOut.style.height = _this.controlHeight + 'px';

		_this.__getImageByUrl();
	};

	ImageControl.prototype.SetVisible = function (bShow) {
		var _this = this;

		if (_this.cIndex == -1) {
			return;
		}

		_this.bVisible = bShow;

		if(_this.bVisible){
			_this.divOut.style.display = '';
		}else{
			_this.divOut.style.display = 'none';
		}

		return true;
	};

	ImageControl.prototype.ChangeControlSize = function (width, height) {
		var _this = this;

		_this.containerWidth = _this.viewer._imgsDivW;
		_this.containerHeight = _this.viewer._imgsDivH;
		
		_this.controlWidth = width;
		_this.controlHeight = height;
		_this.divOut.style.width = _this.controlWidth + 'px';
		_this.divOut.style.height = _this.controlHeight + 'px';

		_this.Left = (_this.containerWidth - _this.controlWidth)/2;
		_this.Top = (_this.containerHeight - _this.controlHeight)/2;

		if(_this.cIndex == _this.viewer.GetCurentIndex())
			_this.SetLocation(_this.Left, _this.Top);

		_this.Show();
		return true;
	};

	// 设置控件位置
	ImageControl.prototype.SetLocation = function (x, y) {
		var _this = this;
		if(arguments.length == 0){
			_this.Left = (_this.containerWidth - _this.controlWidth)/2;
			_this.Top = (_this.containerHeight - _this.controlHeight)/2;
		}
		if(arguments.length == 1){
			_this.Left = x;
		}
		if(arguments.length > 1){
			_this.Left = x;
			_this.Top = y;
		}
		
		if (_this.divOut) {
			if (_this.divOut.parentNode)
				_this.divOut.parentNode.style.position = "relative";
			_this.divOut.style.position = 'absolute';
			_this.divOut.style.left = _this.Left + 'px';
			_this.divOut.style.top = _this.Top + 'px';
		}

		return true;
	};

	ImageControl.prototype.GetEL = function () {
		return this.divOut;
	};

	ImageControl.prototype.GetIndex = function (){
		return this.cIndex;
	}

	ImageControl.prototype.SetIndex = function (index){
		var _this = this;
		if(lib.isNumber(index) && index>=0)
			_this.cIndex = index;
		else
			_this.cIndex = -1;
		return true;
	}

	// 清空图片，显示Loading...
	ImageControl.prototype.ClearImage = function () {
		var _this = this;	

		_this.objImage = false;

		_this._origImageWidth = -1;
		_this._origImageHeight = -1;
		return true;
	};

	// 重新显示图片
	ImageControl.prototype.Show = function () {
		var _this = this;

		if (_this.cIndex == -1) {
			return;
		}

		_this.__fitImage();
		return true;
	};

	ImageControl.prototype.Destroy = function () {
		var _this = this;

		_this.ClearImage();

		return true;
	};

	// 刷新 ImageControl
	ImageControl.prototype.Refresh = function () {
		var _this = this;

		_this.__getImageByUrl();
		return true;
	};

	// 计算 ImageControl 里实际显示 image 的宽高
	ImageControl.prototype.__fitImage = function () {
		var _this = this;
		if(!_this.objImage) return;

		var objImageLeft, objImageTop;
		var containerAspectRatio = _this.controlWidth/_this.controlHeight;
		var imageAspectRatio = _this._origImageWidth/_this._origImageHeight;
		if(containerAspectRatio > imageAspectRatio){
			_this._height = _this.controlHeight;
			_this._width = imageAspectRatio*_this.controlHeight;

			objImageLeft = Math.floor((_this.controlWidth-_this._width)/2);
			objImageTop = 0;
		}else{
			_this._width = _this.controlWidth;
			_this._height = _this.controlWidth/imageAspectRatio;

			objImageLeft = 0;
			objImageTop = Math.floor((_this.controlHeight-_this._height)/2);
		}

		_this.objImage.style.position = 'absolute';
		_this.objImage.style.left = objImageLeft + 'px';
		_this.objImage.style.top = objImageTop + 'px';
		_this.objImage.style.width = _this._width + 'px';
		_this.objImage.style.height = _this._height + 'px';
	}

	//把图片加载到控件上
	ImageControl.prototype.__getImageByUrl = function () {
		var _this = this;

		var newImage = new Image();
		newImage.className = 'aryImages-item';
		newImage.setAttribute('alt', 'image');
		newImage.src = _this.imageUrl;
		newImage.onload = function () {
			_this.objImage = newImage;
			_this._origImageWidth = newImage.width;
			_this._origImageHeight = newImage.height;

			_this.divOut.innerHTML = '';
			_this.divOut.appendChild(_this.objImage);

			_this.Show();
			_this.SetVisible(true);
		};

		newImage.onerror = function (e) {
			//newImage.src = url;
		};
		return true;
	};

	MBC.ImageControl = ImageControl;

})(Alvin.MBC.Lib, Alvin.MBC);(function (DL, MBC) {
	"use strict";
	var lib = DL;

	function ThumbnailControl(cfg) {
		var _this = this;

		// ThumbnailControl 实际占用的宽/高 包括滚动条
		_this._width = 0;
		_this._height = 0;

		// ThumbnailControl 位置信息
		_this.Left = 0;
		_this.Top = 0;

		// ThumbnailControl 的原始宽高
		_this._origImageWidth = 0;
		_this._origImageHeight = 0;

		// canvas宽/高 
		_this.canvasWidth = 0;
		_this.canvasHeight = 0;

		_this.borderWidth = 1; // 暂时为1, 不要改
		_this.borderColor = '#DDDDDD';
		_this.selectionBorderColor = '#7DA2CE';
		_this.backgroundColor = '#FFFFFF';

		_this.bSelect = false;

		// thumbnail 里 image 在 client 端的索引
		_this.cIndex = -1;

		_this.drawArea = {
			width: _this.canvasWidth,
			height: _this.canvasHeight,
			x: 0,
			y: 0
		};

		_this.canvasBackgroundGradientColorPairs = {
			NotSelectedHovering: ['rgb(250,252,253)', 'rgb(239,246,253)'],
			Selected: ['rgb(221,234,252)', 'rgb(199,222,252)']
		};

		_this.bVisible = true;
		_this.thumbOut = false;
		_this.thumbCanvas = false;

		_this.viewer = null;

		_this.thumbnailImagesPerRow = 3;

		_this.attachImage = false;

		// init
		_this.__init(cfg);
	}

	// Method
	// 初始化
	ThumbnailControl.prototype.__init = function (cfg) {
		var _this = this,
			doc = window.document;

		_this.viewer = cfg.viewer;
		_this.Top = _this.viewer.ThumbnailImageMargin;
		_this.Left = _this.viewer.ThumbnailImageMargin;

		_this.thumbnailImagesPerRow = (_this.viewer.thumbnailImagesPerRow > 2) ? (_this.viewer.thumbnailImagesPerRow) : 3;;
		_this._width = _this.viewer.ThumbnailControlW;
		_this._height = _this.viewer.ThumbnailControlH;
		_this.canvasWidth = _this._width;
		_this.canvasHeight = _this._height;

		_this.imageUrl = cfg.imageUrl;
		_this.cIndex = cfg.index;

		_this.thumbOut = doc.createElement('div');
		_this.thumbOut.style.display = 'inline-block';
		_this.thumbOut.style.width = _this._width + 2 + 'px';
		_this.thumbOut.style.height = _this._height + 2 + 'px';
		_this.thumbOut.style.position = 'absolute';
		_this.thumbOut.style.top = _this.Top + 'px';
		_this.thumbOut.style.left = _this.Left + 'px';
		_this.thumbOut.style.border = _this.borderWidth + 'px solid ' + _this.borderColor;
		_this.thumbOut.style.cursor = 'pointer';

		_this.thumbCanvas = doc.createElement('canvas');
		_this.thumbCanvas.style.position = 'relative';
		_this.thumbCanvas.style.top = '0px';
		_this.thumbCanvas.width = _this.canvasWidth;
		_this.thumbCanvas.height = _this.canvasHeight;

		_this.thumbOut.appendChild(_this.thumbCanvas);

		lib.addEvent(_this.thumbOut, "click", function () {
			_this.viewer.ShowImage(_this.cIndex);
		});

		lib.addEvent(_this.thumbOut, "mouseenter", function () {
			_this.bMouseHovering = true;
			if (_this.bSelect) return;
			_this.Show();
		});

		lib.addEvent(_this.thumbOut, "mouseout", function () {
			_this.bMouseHovering = false;
			if (_this.bSelect) return;
			_this.Show();
		});

		_this.__getImageByUrl();
	};

	ThumbnailControl.prototype.SetVisible = function (bShow) {
		var _this = this;

		_this.bVisible = bShow;
		if (bShow) {
			_this.thumbOut.style.display = '';
			_this.Show();
		} else {
			_this.thumbOut.style.display = 'none';
		}
		return true;
	};

	ThumbnailControl.prototype.ChangeControlSize = function (width, height) {
		var _this = this;

		_this._width = width;
		_this._height = height;

		_this.canvasWidth = width;
		_this.canvasHeight = height;

		_this.thumbOut.style.width = _this._width + 2 + 'px';
		_this.thumbOut.style.height = _this._height + 2 + 'px';

		_this.Show();
		return true;
	};

	// 设置背景色
	ThumbnailControl.prototype.SetBackgroundColor = function (bkcolor) {
		var _this = this;
		_this.backgroundColor = bkcolor;

		_this.Show();
		return true;
	};

	// 设置控件位置
	ThumbnailControl.prototype.SetLocation = function (l, t) {
		var _this = this;
		_this.Left = l;
		_this.Top = t;

		if (_this.thumbOut) {
			if (_this.thumbOut.parentNode)
				_this.thumbOut.parentNode.style.position = "relative";
			_this.thumbOut.style.left = l + 'px';
			_this.thumbOut.style.top = t + 'px';
		}

		return true;
	};

	// 设置border颜色
	ThumbnailControl.prototype.SetSelectionImageBorderColor = function (selectionBorderColor) {
		var _this = this;

		_this.selectionBorderColor = selectionBorderColor;
		_this.__refreshBorder();
		return true;
	};

	ThumbnailControl.prototype.GetEL = function () {

		return this.thumbOut;
	};

	ThumbnailControl.prototype.GetControlWidth = function () {
		return this._width;
	};

	ThumbnailControl.prototype.GetControlHeight = function () {
		return this._height;
	};

	ThumbnailControl.prototype.SetIndex = function (index) {
		var _this = this;
		if (lib.isNumber(index) && index >= 0)
			_this.cIndex = index;
		else
			_this.cIndex = -1;
		return true;
	};

	// 清空图片，显示Loading...
	ThumbnailControl.prototype.ClearImage = function () {
		var _this = this;

		_this.objImage = false;

		_this._origImageWidth = -1;
		_this._origImageHeight = -1;
		return true;
	};

	// 重新显示图片
	ThumbnailControl.prototype.Show = function (bShowFromScrollEvent) {
		var _this = this,
			ctx;

		if (_this.bVisible) {
			_this.thumbOut.style.display = 'inline-block';
		} else {
			_this.thumbOut.style.display = 'none';
			return;
		}

		ctx = _this.thumbCanvas.getContext("2d");
		_this.__restoreCanvas(ctx, _this.canvasWidth, _this.canvasHeight);

		ctx.clearRect(0, 0, _this.canvasWidth, _this.canvasHeight);

		if (!_this.objImage ||
			_this.objImage.src == 'data:,' ||
			_this.objImage.width == 0 || _this.objImage.height == 0 ||
			_this.objImage.src == '') {

			// fill background color
			ctx.fillStyle = _this.backgroundColor;

			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			// if width>53px show "Loading..."

			if (_this._width > 53) {
				ctx.font = "12px Times New Roman";
				ctx.textAlign = "center";
				ctx.strokeText("Loading...", ctx.canvas.width * 0.5, ctx.canvas.height * 0.5);
			}

			//Actually draw the image on canvas

			return false;
		}

		if (_this.cIndex == -1) {
			return;
		}

		_this.__fitImage();

		if (_this.drawArea.width < _this.canvasWidth || _this.drawArea.height < _this.canvasHeight) {
			// 如果宽、高比当前画布小，说明有留白，需要画背景色
			var gradient = ctx.createLinearGradient(0, 0, _this.canvasWidth, _this.canvasHeight);

			if (_this.bSelect) {
				gradient.addColorStop(0, _this.canvasBackgroundGradientColorPairs.Selected[0]);
				gradient.addColorStop(1, _this.canvasBackgroundGradientColorPairs.Selected[1]);
				ctx.fillStyle = gradient;
			} else if (_this.bMouseHovering) {
				gradient.addColorStop(0, _this.canvasBackgroundGradientColorPairs.NotSelectedHovering[0]);
				gradient.addColorStop(1, _this.canvasBackgroundGradientColorPairs.NotSelectedHovering[1]);
				ctx.fillStyle = gradient;
			} else {
				ctx.fillStyle = _this.backgroundColor;
			}

			ctx.fillRect(0, 0, _this.canvasWidth, _this.canvasHeight);
		}

		if (_this.objImage) {

			if (_this.attachImage) {
				_this.thumbOut.style.position = 'relative';
				_this.objImage.style.position = 'absolute';
				_this.objImage.style.top = Math.floor(_this.drawArea.y) + 'px';
				_this.objImage.style.left = Math.floor(_this.drawArea.x) + 'px';

				_this.thumbOut.appendChild(_this.objImage);
			} else {
				ctx.drawImage(_this.objImage, Math.floor(_this.drawArea.x), Math.floor(_this.drawArea.y), _this.drawArea.width, _this.drawArea.height);
			}

		}

		return true;
	};

	// 图片被选中
	ThumbnailControl.prototype.SetSelect = function (bSelect) {
		var _this = this;
		_this.bSelect = bSelect;
		_this.__refreshBorder();
		_this.Show();
		return true;
	};


	ThumbnailControl.prototype.Destroy = function () {
		var _this = this;

		if (_this.thumbCanvas) {
			var ctx = _this.thumbCanvas.getContext("2d");
			if (_this.canvasWidth > 0 && _this.canvasHeight > 0)
				ctx.clearRect(0, 0, _this.canvasWidth, _this.canvasHeight);
		}

		_this.ClearImage();

		return true;
	};

	ThumbnailControl.prototype.Refresh = function () {
		var _this = this;

		_this.__getImageByUrl();

		return true;
	};

	// 清空图片，显示Loading...
	ThumbnailControl.prototype.ClearControl = function () {
		var _this = this;

		_this.ClearImage();
		_this.Show();
		return true;
	};

	// 计算 ThumbnailControl 里实际显示 image 的宽高
	ThumbnailControl.prototype.__fitImage = function () {
		var _this = this;
		var canvasAspectRatio = _this.canvasWidth / _this.canvasHeight;
		var imageAspectRatio = _this._origImageWidth / _this._origImageHeight;
		if (canvasAspectRatio > imageAspectRatio) {
			_this.drawArea.height = _this.canvasHeight;
			_this.drawArea.width = imageAspectRatio * _this.canvasHeight;

			_this.drawArea.x = Math.floor((_this.canvasWidth - _this.drawArea.width) / 2);
			_this.drawArea.y = 0;
		} else {
			_this.drawArea.width = _this.canvasWidth;
			_this.drawArea.height = _this.drawArea.width / imageAspectRatio;

			_this.drawArea.x = 0;
			_this.drawArea.y = Math.floor((_this.canvasHeight - _this.drawArea.height) / 2);
		}
	}

	//把图片加载到控件上
	ThumbnailControl.prototype.__getImageByUrl = function () {
		var _this = this;

		var newImage = new Image();
		newImage.className = 'aryThumbnailControls-item';
		newImage.setAttribute('alt', 'image');
		newImage.src = _this.imageUrl;
		newImage.onload = function () {
			_this.objImage = newImage;
			_this._origImageWidth = newImage.width;
			_this._origImageHeight = newImage.height;

			_this.Show();
		};

		newImage.onerror = function (e) {
			//newImage.src = url;
		};

		return true;
	};

	ThumbnailControl.prototype.__restoreCanvas = function (ctx, w, h) {
		var _this = this;
		ctx.canvas.width = w;
		ctx.canvas.height = h;

		return true;
	};

	ThumbnailControl.prototype.__refreshBorder = function () {
		var _this = this;
		if (_this.bSelect) {
			// set border
			_this.thumbOut.style.border = _this.borderWidth + 'px solid ' + _this.selectionBorderColor;
			_this.thumbOut.style.cursor = 'default';
		} else {
			_this.thumbOut.style.border = _this.borderWidth + 'px solid ' + _this.borderColor;
			_this.thumbOut.style.cursor = 'pointer';
		}

		return true;
	};

	MBC.ThumbnailControl = ThumbnailControl;

})(Alvin.MBC.Lib, Alvin.MBC);(function (DL, MBC) {
    "use strict";
    var lib = DL;

    function ImageViewer(cfg) {
        var _this = this;
        var containerDiv = [
            '<div class="imageContainer">',
            '<div class="kPainterImgsDiv">',
            '<canvas class="kPainterCanvas" style="display:none;position:absolute;"></canvas>',
            '</div>',
            '</div>',
            '<div class="thumbnailContainer"></div>'
        ].join('');
        _this._imageViewer = document.getElementById(cfg.ContainerId);
        _this._imageViewer.innerHTML = containerDiv;
        _this._canvas = lib._querySelectorAll(_this._imageViewer, 'canvas.kPainterCanvas')[0];
        _this.ctx = _this._canvas.getContext('2d');
        _this._imgContainer = lib._querySelectorAll(_this._imageViewer, 'div.imageContainer')[0];
        _this._imgsDiv = lib._querySelectorAll(_this._imageViewer, 'div.kPainterImgsDiv')[0];
        _this._thumbnailContainer = lib._querySelectorAll(_this._imageViewer, 'div.thumbnailContainer')[0];

        if (cfg.Width)
            _this._imageViewerW = cfg.Width;

        if (cfg.Height)
            _this._imageViewerH = cfg.Height;

        _this._imageViewer.style.width = _this._imageViewerW;
        _this._imageViewer.style.height = _this._imageViewerH;

        _this._defaultFileInput = document.createElement("input");
        _this._defaultFileInput.setAttribute("type", "file");
        _this._defaultFileInput.setAttribute("accept", "image/bmp,image/gif,image/jpeg,image/png,image/webp");
        _this._defaultFileInput.setAttribute("multiple", "true");

        _this.curIndex = -1;

        // ImageViewer 当前所处的模式：view、edit
        _this.mode = 'view';

        _this._errorCode = 0;
        _this._errorString = '';

        // ImageControl 数组
        _this.aryImageControls = [];
        _this.BackgroundColor = "#FFFFFF";

        // ThumbnailControl 数组
        _this.aryThumbnailControls = [];
        // Thumbnails 中多个控件之间的距离
        _this.ThumbnailImageMargin = 10;
        // Thumbnails 中的小控件的宽度
        _this.ThumbnailControlW = 0;
        // Thumbnails 中的小控件的高度
        _this.ThumbnailBackgroundColor = "#FFFFFF";
        _this.ThumbnailControlH = 0;
        _this._thumbnailsDiv = document.createElement('div');
        _this._thumbnailsDiv.style.width = _this._thumbnailContainerW + 'px';
        // _this._thumbnailsDiv.style.width = '100%';
        _this._thumbnailContainer.appendChild(_this._thumbnailsDiv);

        lib.addEvent(_this._defaultFileInput, "change", function (event) {
            var ev = event || window.event;

            if (_this.beforeAddImgFromFileChooseWindow) {
                lib.doCallbackNoBreak(_this.beforeAddImgFromFileChooseWindow, [ev, false]);
            } else {
                _this.LoadImageEx(ev.target.files);
            }

        });

        lib.addEvent(_this._imageViewer, "dragover", function (event) {
            var ev = event || window.event;
            lib.stopDefault(ev);
        });

        lib.addEvent(_this._imageViewer, "drop", function (event) {
            var ev = event || window.event;
            if (_this.mode != 'view') return;
            lib.stopDefault(ev);
            _this.LoadImageEx(ev.dataTransfer.files);
        });

        _this._startPos = {};
        lib.addEvent(_this._imgContainer, "touchstart mousedown", fuc_touchstart);
        lib.addEvent(_this._imgContainer, "touchmove", fuc_touchmove);
        lib.addEvent(_this._imgContainer, "touchend mouseup", fuc_touchend);

        function fuc_touchstart(event) {
            var ev = event || window.event;
            if (_this.mode != 'view') return;
            lib.stopDefault(ev);

            lib.addEvent(_this._imgContainer, "mousemove", fuc_touchmove);
            lib.addEvent(_this._imgContainer, "mouseleave", fuc_touchend);

            var touches = ev.changedTouches;

            if (touches) {
                //Multi-contact is prohibited
                if (touches.length != 1) {
                    return false;
                }

                _this._startPos = {
                    startX: touches[0].pageX,
                    startY: touches[0].pageY
                }
            } else {
                _this._startPos = {
                    startX: ev.clientX,
                    startY: ev.clientY
                }
            }

        }

        function fuc_touchmove(event) {
            var ev = event || window.event;
            if (_this.mode != 'view') return;
            lib.stopDefault(ev);

            if (_this.GetCount() < 2) {
                return false;
            }

            var touches = ev.changedTouches;

            if (touches) {
                var _curOffsetX = touches[0].pageX - _this._startPos.startX,
                    _curOffsetY = touches[0].pageY - _this._startPos.startY;
            } else {
                var _curOffsetX = ev.clientX - _this._startPos.startX,
                    _curOffsetY = ev.clientY - _this._startPos.startY;
            }

            var _aryImgs = _this.aryImageControls,
                _curIndex = _this.curIndex,
                _pIndex = (_curIndex - 1) < 0 ? (_aryImgs.length - 1) : (_curIndex - 1),
                _nIndex = (_curIndex + 1) > (_aryImgs.length - 1) ? 0 : (_curIndex + 1);

            _aryImgs[_curIndex].SetLocation((_this._imgsDivW - _aryImgs[_curIndex].controlWidth) / 2 + _curOffsetX);
            _aryImgs[_pIndex].SetLocation(-(_this._imgContainerW - _curOffsetX));
            _aryImgs[_nIndex].SetLocation(_this._imgContainerW + _curOffsetX);

            //console.log('pageX: '+touches[0].pageX+" pageY: "+touches[0].pageY);   
        }

        function fuc_touchend(event) {
            var ev = event || window.event;
            if (_this.mode != 'view') return;
            lib.stopDefault(ev);

            if (_this.GetCount() < 1) {
                return false;
            }

            lib.removeEvent(_this._imgContainer, "mousemove", fuc_touchmove);
            lib.removeEvent(_this._imgContainer, "mouseleave", fuc_touchend);

            if (_this.GetCount() < 2) {
                return false;
            }

            var touches = ev.changedTouches;

            if (touches) {
                var _curOffsetX = touches[0].pageX - _this._startPos.startX,
                    _curOffsetY = touches[0].pageY - _this._startPos.startY;
            } else {
                var _curOffsetX = ev.clientX - _this._startPos.startX,
                    _curOffsetY = ev.clientY - _this._startPos.startY;
            }

            if (_curOffsetX > _this._imgsDivW / 3) {
                _this.ChangePage('p');
            } else if (_curOffsetX < -_this._imgsDivW / 3) {
                _this.ChangePage('n');
            } else {
                _this.__reInitImageControlPosition();
            }
        }

        //https://developer.mozilla.org/zh-CN/docs/Web/Events

        // 操做数组：记录操作方法
        _this.stack = [];
        _this.curStep = -1;

        // ImageViewer 当前显示的图片是否因为旋转而宽高互换
        _this.isSwitchedWH = false;

        // 是否替换原图
        _this.replaceOriginalImage = false;

        // Canvas 的宽高和位置信息
        _this._canvasArea = {
            width: 300,
            height: 150,
            left: 0,
            top: 0
        };

        _this.videoSettings = {
            video: {
                /*width:{ideal:2048},height:{ideal:2048},*/
                facingMode: {
                    ideal: "environment"
                }
            }
        };

        var cfg = {};
        cfg.viewer = _this;
        cfg.videoSettings = _this.videoSettings;
        cfg.container = _this._imgContainer;

        _this.VideoViewer = new MBC.VideoViewer(cfg);
        _this.ImageAreaSelector = new MBC.ImageAreaSelector(cfg);

        lib.attachProperty(_this);
        // 设置  ImageViewer 里的元素宽高
        _this.__init();
    }

    ImageViewer.prototype.beforeAddImgFromFileChooseWindow = null;
    ImageViewer.prototype.afterAddImgFromFileChooseWindow = null;

    ImageViewer.prototype.beforeAddImgFromDropFile = null;
    ImageViewer.prototype.afterAddImgFromDropFile = null;

    ImageViewer.prototype.__init = function () {
        var _this = this;

        _this._imageViewerW = lib.getElDimensions(_this._imageViewer).clientWidth;
        _this._imageViewerH = lib.getElDimensions(_this._imageViewer).clientHeight;

        _this._imgContainerW = lib.getElDimensions(_this._imgContainer).clientWidth;
        _this._imgContainerH = lib.getElDimensions(_this._imgContainer).clientHeight;

        _this._imgsDivW = lib.getElDimensions(_this._imgsDiv).clientWidth;
        _this._imgsDivH = lib.getElDimensions(_this._imgsDiv).clientHeight;

        _this._thumbnailContainerW = lib.getElDimensions(_this._thumbnailContainer).clientWidth;
        _this._thumbnailContainerH = lib.getElDimensions(_this._thumbnailContainer).clientHeight;
        // _this._thumbnailContainerH = _this._imageViewerH;

        // console.log(_this._thumbnailContainerW, "_this._thumbnailContainerW ")
        // console.log(_this._thumbnailContainerH, "_this._thumbnailContainerH ")
        // console.log(_this.thumbnailImagesPerRow, "_this.thumbnailImagesPerRow ")
        // console.log(Math.floor(_this._thumbnailContainerH / _this._thumbnailContainerW), "Math.floor(_this._thumbnailContainerH / _this._thumbnailContainerW) ")

        // Thumbnails 中每行的控件数
        _this.thumbnailImagesPerRow = Math.floor(_this._thumbnailContainerH / _this._thumbnailContainerW) > 2 ? Math.floor(_this._thumbnailContainerH / _this._thumbnailContainerW) : 3;

        _this._thumbnailsDiv.style.height = _this._thumbnailContainerH + 'px';
    }

    ImageViewer.prototype.AdaptiveLayout = function () {
        var _this = this;

        _this.__init();

        // 重置 ImageControl 控件的宽高和位置
        var _aryImgs = _this.aryImageControls;
        for (var i = 0; i < _aryImgs.length; i++) {
            var tempW = _aryImgs[i].controlWidth,
                tempH = _aryImgs[i].controlHeight;
            if (tempW < _this._imgsDivW && tempH < _this._imgsDivH) {
                _aryImgs[i].ChangeControlSize(tempW, tempH);
            } else {
                _aryImgs[i].ChangeControlSize(_this._imgsDivW, _this._imgsDivH);
            }
        }

        // 重置 ThumbnailControl 控件的宽高和位置
        _this.__reInitThumbnailControlPosition();

        // 重置 canvas 控件的宽高和位置
        if (_this.mode == 'edit') {
            _this.__setCanvasStyleFit();
        }

        return true;
    }

    ImageViewer.prototype.LoadImageEx = function (imgData) {
        var _this = this;
        if (_this.mode == 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'LoadImageEx', 'edit');
            return false;
        }

        if (arguments.length == 0) {
            _this.ShowFileChooseWindow();
            return;
        }

        if (imgData instanceof Blob || imgData instanceof HTMLCanvasElement || typeof imgData == "string" || imgData instanceof String || imgData instanceof HTMLImageElement) {
            lib.getBlobFromAnyImgData(imgData, function (blob) {
                _this.LoadImageInner(blob);
            });
        } else if (imgData instanceof Array || imgData instanceof FileList) {
            for (var i = 0; i < imgData.length; ++i) {
                _this.LoadImageEx(imgData[i]);
            }
            return;
        } else {
            //_this._errorString = "addImage(imgData): Type of 'imgData' should be 'Blob', 'HTMLCanvasElement', 'HTMLImageElement', 'String(url)', 'Array(a array of source)', 'FileList'.";
            lib.Errors.InvalidParameterType(_this);
            return false;
        }
    }

    ImageViewer.prototype.LoadImageInner = function (url) {
        var _this = this,
            cfg = {};
        cfg.viewer = _this;
        cfg.imageViewerW = _this._imageViewerW;
        cfg.imageViewerH = _this._imageViewerH;
        cfg.imgContainerW = _this._imgsDivW;
        cfg.imgContainerH = _this._imgsDivH;
        cfg.index = _this.curIndex = _this.aryImageControls.length;

        if (url instanceof Blob) {
            cfg.imageUrl = URL.createObjectURL(url);
        } else {
            cfg.imageUrl = url;
        }

        // 添加 ImageControl 
        var objImageControl = new MBC.ImageControl(cfg);
        _this.aryImageControls.push(objImageControl);
        _this.__addImgToContainer(objImageControl.GetEL());

        // 添加 ThumbnailControl 
        var objThumbnailControl = new MBC.ThumbnailControl(cfg);
        _this.aryThumbnailControls.push(objThumbnailControl);
        _this.__addImgToThumbnail(objThumbnailControl.GetEL());

        _this.__resetSelection();

        _this._updateNumUI();
        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.ShowVideo = function () {
        this.VideoViewer.showVideo();
        return true;
    };

    ImageViewer.prototype.ShowImage = function (index) {
        var _this = this;

        if (index < 0 || index > _this.aryImageControls.length - 1) {
            lib.Errors.InvalidValue(_this);
            return false;
        }
        _this.curIndex = index;

        _this.__reInitImageControlPosition();
        _this.__resetSelection();

        _this._updateNumUI();

        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.ChangePage = function (cmd) {
        var _this = this;
        var _index;
        switch (cmd) {
            case "f":
                _index = 0;
                break;
            case "p":
                _index = _this.curIndex - 1;
                break;
            case "n":
                _index = _this.curIndex + 1;
                break;
            case "l":
                _index = _this.aryImageControls.length - 1;
                break;
            default:
                if (arguments.length < 1 || isNaN(cmd)) {
                    return false;
                } else {
                    _index = Math.round(cmd);
                }
        }
        /*eslint-enable indent*/
        if (_index < 0) {
            _index = _this.aryImageControls.length - 1;
        } else if (_index > _this.aryImageControls.length - 1) {
            _index = 0;
        }

        _this.ShowImage(_index);
        return true;
    };

    ImageViewer.prototype.GetCurentIndex = function () {
        return this.curIndex;
    }

    ImageViewer.prototype.GetCount = function () {
        return this.aryImageControls.length;
    }

    ImageViewer.prototype.GetImage = function (index, isOri) {
        var _curIndex = index || this.curIndex;
        if (isOri) {
            return this.aryImageControls[_curIndex];
        } else {
            return this.aryImageControls[_curIndex].cloneNode(true);
        }

    }

    lib.each(['SaveAsBMP', 'SaveAsJPEG', 'SaveAsTIFF', 'SaveAsPNG', 'SaveAsPDF'], function (method) {
        ImageViewer.prototype[method] = function (filename, index) {
            var _this = this;
            if (_this.mode == 'edit') {
                lib.Errors.FucNotValidInThisMode(_this, method, 'edit');
                return false;
            }
            if (arguments.length < 2) {
                index = _this.curIndex;
            }
            if (!lib.isNumber(index)) {
                return false;
            }
            index = Math.round(index);
            if (index < 0 || index >= _this.aryImageControls.length) {
                return false;
            }

            var a = document.createElement('a');
            a.target = '_blank';
            var img = _this.aryImageControls[index].objImage;
            var blob = img.src;

            if (!filename) {
                filename = (new Date()).getTime() + '.png';
            }
            a.download = filename;
            //var objUrl = URL.createObjectURL(blob);
            var objUrl = blob;
            a.href = objUrl;
            var ev = new MouseEvent('click', {
                "view": window,
                "bubbles": true,
                "cancelable": false
            });
            a.dispatchEvent(ev);
            //a.click();
            setTimeout(function () {
                URL.revokeObjectURL(objUrl);
            }, 10000);
            return filename;
        };
    });

    ImageViewer.prototype.ShowFileChooseWindow = function () {
        var _this = this;
        if (_this.mode == 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'ShowFileChooseWindow', 'edit');
            return false;
        }

        _this._defaultFileInput.click();
        return true;
    };

    // 获取 imageviewer 的背景色
    ImageViewer.prototype.GetBackgroundColor = function (v) {
        return this.BackgroundColor;
    };

    // 设置 imageviewer 的背景色
    ImageViewer.prototype.SetBackgroundColor = function (v) {
        var _this = this;
        _this.BackgroundColor = v;

        if (_this._imgContainer)
            _this._imgContainer.style.backgroundColor = v;

        lib.Errors.Sucess(_this);
        return true;
    };

    // 设置裁切框的背景色
    ImageViewer.prototype.SetCropBackgroundColor = function (v) {
        var _this = this;
        var cells = _this.ImageAreaSelector.kPainterCells;
        _this.ImageAreaSelector.backgroundColor = v;
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = v;
        }
        lib.Errors.Sucess(_this);
        return true;
    }

    // 设置裁切框的边框色
    ImageViewer.prototype.SetCropBorderColor = function (v) {
        var _this = this;
        var cells = _this.ImageAreaSelector.kPainterCells;
        var corners = _this.ImageAreaSelector.kPainterCorners;
        _this.ImageAreaSelector.borderColor = v;
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.borderColor = v;
        }
        for (var i = 0; i < corners.length; i++) {
            corners[i].style.borderColor = v;
        }
        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.GetThumbnaiBackgroundColor = function (v) {
        return this.ThumbnailBackgroundColor;
    };

    ImageViewer.prototype.SetThumbnailBackgroundColor = function (v) {
        var _this = this;
        _this.ThumbnailBackgroundColor = v;

        if (_this._thumbnailContainer)
            _this._thumbnailContainer.style.backgroundColor = v;

        for (var i = 0; i < _this.aryThumbnailControls.length; i++) {
            _this.aryThumbnailControls[i].SetBackgroundColor(_this.ThumbnailBackgroundColor);
        }

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.GetThumbnailImageMargin = function () {
        var _this = this;
        return _this.ThumbnailImageMargin;
    };

    ImageViewer.prototype.SetThumbnailImageMargin = function (v) {
        var _this = this;

        if (v <= 0 || (v > _this._thumbnailContainerH / _this.thumbnailImagesPerRow) || (v > _this._thumbnailContainerW)) {
            lib.Errors.InvalidValue(_this);
            return false;
        } else {
            _this.ThumbnailImageMargin = parseInt(v);

            _this.__reInitThumbnailControlPosition();
            lib.Errors.Sucess(_this);
            return true;
        }
    };

    ImageViewer.prototype.ShowImageEditor = function () {
        var _this = this;
        if (_this.mode == 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'ShowImageEditor', 'edit');
            return false;
        } else if (_this.curIndex < 0) {
            lib.Errors.IndexOutOfRange(_this);
            return false;
        }
        _this.mode = 'edit';

        var curImg = _this.aryImageControls[_this.curIndex];
        curImg.SetVisible(false);
        _this.__setCanvasVisible(true);
        _this.ctx.clearRect(0, 0, _this._canvasArea.width, _this._canvasArea.height);
        _this._canvasArea = {
            width: 300,
            height: 150,
            left: 0,
            top: 0
        };
        var transformNew = new kUtil.Matrix(1, 0, 0, 1, 0, 0);
        $(_this._canvas).setTransform(transformNew);
        var _curStack = {
            fun: 'ShowImageEditor',
            crop: {
                x: 0,
                y: 0,
                width: 1,
                height: 1
            },
            draw: {
                x: 0,
                y: 0,
                width: curImg._origImageWidth,
                height: curImg._origImageHeight
            },
            transform: new kUtil.Matrix(1, 0, 0, 1, 0, 0),
            srcBlob: curImg.imageUrl
        };
        _this.stack.push(_curStack);
        _this.curStep++;

        _this.__updateCanvasInner(false);

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.CloseImageEditor = function (bShowImg) {
        var _this = this;
        if (_this.mode == 'view') {
            lib.Errors.FucNotValidInThisMode(_this, 'CloseImageEditor', 'view');
            return false;
        }
        _this.mode = 'view';
        var _bShowImg = (bShowImg == false) ? false : true;

        _this.__setCanvasVisible(false);
        _this.aryImageControls[_this.curIndex].SetVisible(_bShowImg);
        _this.stack = [];
        _this.curStep = -1;
        _this.isSwitchedWH = false;
        _this.ImageAreaSelector.HideCropRect();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.RotateLeft = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'RotateLeft', 'view');
            return false;
        }

        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0, -1, 1, 0, 0, 0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.__pushStack('rotateLeft');
        _this.__setCanvasStyleFit();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.RotateRight = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'RotateRight', 'view');
            return false;
        }

        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0, 1, -1, 0, 0, 0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.__pushStack('rotateRight');
        _this.__setCanvasStyleFit();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.Rotate = function (index, angle) {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Rotate', 'view');
            return false;
        }

        var rotateRightTime = parseInt(angle / 90);
        var transformNew = $(_this._canvas).getTransform();
        for (var i = 0; i < rotateRightTime; i++) {
            transformNew = kUtil.Matrix.dot(new kUtil.Matrix(0, 1, -1, 0, 0, 0), transformNew);
        }
        $(_this._canvas).setTransform(transformNew);

        _this.__pushStack('rotateRight');
        _this.__setCanvasStyleFit();

        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.Mirror = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Mirror', 'view');
            return false;
        }

        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(-1, 0, 0, 1, 0, 0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.__pushStack('mirror');
        _this.__setCanvasStyleFit();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.Flip = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Flip', 'view');
            return false;
        }

        var transformOri = $(_this._canvas).getTransform();
        var transformNew = kUtil.Matrix.dot(new kUtil.Matrix(1, 0, 0, -1, 0, 0), transformOri);
        $(_this._canvas).setTransform(transformNew);

        _this.__pushStack('flip');
        _this.__setCanvasStyleFit();

        lib.Errors.Sucess(_this);
        return true;
    };

    ImageViewer.prototype.Crop = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Crop', 'view');
            return false;
        }
        var _newCropArea = _this.ImageAreaSelector.__getCropArea();
        if (_newCropArea.x == 0 && _newCropArea.y == 0 && _newCropArea.width == 1 && _newCropArea.height == 1) {
            return;
        }

        _this.__pushStack('Crop');

        _this.__updateCanvasInner(false);

        lib.Errors.Sucess(_this);
        return true;
    }

    ImageViewer.prototype.Save = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Save', 'view');
            return false;
        }

        _this.__updateCanvasInner(true);

        _this.CloseImageEditor(false);
        if (!_this.replaceOriginalImage) {
            _this.LoadImageEx(_this._canvas);
        } else {
            lib.canvasToBlob(_this._canvas, function (blob) {
                var url = URL.createObjectURL(blob);
                var curImg = _this.aryImageControls[_this.curIndex];
                var curThumbImg = _this.aryThumbnailControls[_this.curIndex];

                curImg.imageUrl = url;
                curImg.Refresh();

                curThumbImg.imageUrl = url;
                curThumbImg.Refresh();
            });
        }
        return true;
    }

    ImageViewer.prototype.Undo = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Undo', 'view');
            return false;
        }
        if (_this.curStep > 0) {
            var toStep = _this.curStep - 1;
            while (null == _this.stack[toStep]) {
                --toStep;
            }
            _this.__fromToStepAsync(_this.curStep, toStep);
        }
    }

    ImageViewer.prototype.Redo = function () {
        var _this = this;
        if (_this.mode != 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'Redo', 'view');
            return false;
        }
        if (_this.curStep < _this.stack.length - 1) {
            var toStep = _this.curStep + 1;
            while (null == _this.stack[toStep]) {
                ++toStep;
            }
            _this.__fromToStepAsync(_this.curStep, toStep);
        }
    }

    ImageViewer.prototype.RemoveAllSelectedImages = function () {
        var _this = this,
            index = _this.curIndex;
        if (_this.mode == 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'RemoveAllSelectedImages', 'edit');
            return false;
        }

        // 删除 ImageControl 控件
        _this.__RemoveImageControl(index);

        // 删除 ThumbnailControl 控件
        _this.__RemoveThumbnailControl(index);

        var _index = _this.curIndex > (_this.aryImageControls.length - 1) ? (_this.aryImageControls.length - 1) : _this.curIndex;
        _this.ShowImage(_index);

        return true;
    }

    ImageViewer.prototype.RemoveAllImages = function () {
        var _this = this,
            i;
        if (_this.mode == 'edit') {
            lib.Errors.FucNotValidInThisMode(_this, 'RemoveAllImages', 'edit');
            return false;
        }

        // 删除 ImageControl 控件
        var iCount = _this.aryImageControls.length;
        for (i = iCount - 1; i >= 0; i--) {
            _this.__RemoveImageControl(i);
        }

        // 删除 ThumbnailControl 控件
        var iThumbCount = _this.aryThumbnailControls.length;
        for (i = iThumbCount - 1; i >= 0; i--) {
            _this.__RemoveThumbnailControl(i);
        }

        return true;
    }

    ImageViewer.prototype.__RemoveImageControl = function (index) {
        var _this = this;
        if (index < _this.aryImageControls.length && index >= 0) {
            var objImgControl = _this.aryImageControls[index];
            objImgControl.Destroy();
            _this.aryImageControls.splice(index, 1);
            _this._imgsDiv.removeChild(objImgControl.GetEL());
        }
        for (var i = index; i < _this.aryImageControls.length; i++) {
            var objImgControl = _this.aryImageControls[i];
            objImgControl.SetIndex(i);
        }
    }

    ImageViewer.prototype.__RemoveThumbnailControl = function (index) {
        var _this = this;
        if (index < _this.aryThumbnailControls.length && index >= 0) {
            var objThumbControl = _this.aryThumbnailControls[index];
            objThumbControl.Destroy();
            _this.aryThumbnailControls.splice(index, 1);
            _this._thumbnailsDiv.removeChild(objThumbControl.GetEL());
        }
        for (var i = index; i < _this.aryThumbnailControls.length; i++) {
            var objThumbControl = _this.aryThumbnailControls[i];
            objThumbControl.SetIndex(i);
        }
        _this.__reInitThumbnailControlPosition();
    }

    ImageViewer.prototype.__updateCanvasInner = function (bTrueTransform) {
        var _this = this;
        var img = _this.aryImageControls[_this.curIndex].objImage;
        var imgOW = img.naturalWidth || img.width;
        var imgOH = img.naturalHeight || img.height;
        var process = _this.stack[_this.curStep];
        var crop = process.crop;
        var tsf = process.transform;
        var ctx = _this.ctx;
        var cvs = _this._canvas;

        var sWidth = cvs.fullQualityWidth = Math.round(imgOW * crop.width) || 1,
            sHeight = cvs.fullQualityHeight = Math.round(imgOH * crop.height) || 1;
        if (0 != tsf.a * tsf.d && 0 == tsf.b * tsf.c) {
            cvs.fullQualityWidth = sWidth;
            cvs.fullQualityHeight = sHeight;
        } else {
            cvs.fullQualityWidth = sHeight;
            cvs.fullQualityHeight = sWidth;
            if (bTrueTransform) {
                _this.isSwitchedWH = true;
            }
        }
        $(cvs).setTransform(new kUtil.Matrix(1, 0, 0, 1, 0, 0));
        cvs.hasCompressed = false;
        if (bTrueTransform) {
            var cvsW, cvsH;
            if (_this.isSwitchedWH) {
                cvsW = sHeight;
                cvsH = sWidth;
            } else {
                cvsW = sWidth;
                cvsH = sHeight;
            }
            cvs.width = cvsW;
            cvs.height = cvsH;
            var drawE = cvsW / 2 * (1 - tsf.a - tsf.c),
                drawF = cvsH / 2 * (1 - tsf.b - tsf.d);
            ctx.setTransform(tsf.a, tsf.b, tsf.c, tsf.d, drawE, drawF);
        } else {
            cvs.width = sWidth;
            cvs.height = sHeight;
        }
        var sx = Math.round(imgOW * crop.x),
            sy = Math.round(imgOH * crop.y);
        if (sx == imgOW) {
            --sx;
        }
        if (sy == imgOH) {
            --sy;
        }
        var dWidth, dHeight;
        if (_this.isSwitchedWH && bTrueTransform) {
            dWidth = cvs.height;
            dHeight = cvs.width;
        } else {
            dWidth = cvs.width;
            dHeight = cvs.height;
        }
        ctx.clearRect(0, 0, dWidth, dHeight);
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
        if (bTrueTransform) {
            $(cvs).setTransform(new kUtil.Matrix(1, 0, 0, 1, 0, 0));
        } else {
            $(cvs).setTransform(tsf);
        }

        _this.__setCanvasStyleFit(bTrueTransform);
    };

    ImageViewer.prototype.__fromToStepAsync = function (fromStep, toStep, callback) {
        var _this = this;
        _this.curStep = toStep;
        var _crop = _this.stack[fromStep].crop;
        var crop = _this.stack[_this.curStep].crop;
        if (_crop.x == crop.x &&
            _crop.y == crop.y &&
            _crop.width == crop.width &&
            _crop.bottom == crop.bottom &&
            _this.stack[fromStep].srcBlob == _this.stack[_this.curStep].srcBlob
        ) {
            // case only do transform, don't redraw mainCvs
            $(_this._canvas).setTransform(_this.stack[_this.curStep].transform.dot(_this.stack[fromStep].transform.inversion()).dot($(_this._canvas).getTransform()));
            _this.__setCanvasStyleFit();
            if (callback) {
                callback();
            }
        } else {
            _this.__updateCanvasInner(false);
        }
    };

    ImageViewer.prototype.__setCanvasStyleFit = function (bTrueTransform) {
        var _this = this;
        var ca = _this._canvasArea;
        var tsf = _this.stack[_this.curStep].transform;
        if (0 != tsf.a * tsf.d && 0 == tsf.b * tsf.c) {
            _this.isSwitchedWH = false;
        } else {
            _this.isSwitchedWH = true;
        }

        if (_this.isSwitchedWH && !bTrueTransform) {
            var imageAspectRatio = _this._canvas.height / _this._canvas.width;
        } else {
            var imageAspectRatio = _this._canvas.width / _this._canvas.height;
        }

        var imgsDivAspectRatio = _this._imgsDivW / _this._imgsDivH;

        if (imgsDivAspectRatio > imageAspectRatio) {
            ca.height = _this._imgsDivH;
            ca.width = imageAspectRatio * _this._imgsDivH;
        } else {
            ca.width = _this._imgsDivW;
            ca.height = ca.width / imageAspectRatio;
        }

        if (_this.isSwitchedWH && !bTrueTransform) {
            var tempW = ca.width;
            ca.width = ca.height;
            ca.height = tempW;
        }

        ca.left = Math.floor((_this._imgsDivW - ca.width) / 2);
        ca.top = Math.floor((_this._imgsDivH - ca.height) / 2);

        _this._canvas.style.left = ca.left + 'px';
        _this._canvas.style.top = ca.top + 'px';
        _this._canvas.style.width = ca.width + 'px';
        _this._canvas.style.height = ca.height + 'px';

        _this.ImageAreaSelector.ShowCropRect();
    }

    ImageViewer.prototype.__addImgToContainer = function (objImg) {
        var _this = this;

        _this._imgsDiv.appendChild(objImg);

        _this.__reInitImageControlPosition();
        return true;
    }

    ImageViewer.prototype.__addImgToThumbnail = function (objThumb) {
        var _this = this;

        _this._thumbnailsDiv.appendChild(objThumb);

        _this.__reInitThumbnailControlPosition();

        return true;
    }

    ImageViewer.prototype.__resetSelection = function () {
        var _this = this,
            i = 0;

        // 更新 thumbnail 的选择状态
        for (i = 0; i < _this.aryThumbnailControls.length; i++) {
            var thumbControl = _this.aryThumbnailControls[i];
            if (thumbControl.bVisible) {
                if (thumbControl.cIndex != _this.curIndex)
                    thumbControl.SetSelect(false);
                else if (thumbControl.cIndex == _this.curIndex)
                    thumbControl.SetSelect(true);
            }
        }
    };

    ImageViewer.prototype.__reInitImageControlPosition = function () {
        var _this = this;

        var _aryImgs = _this.aryImageControls,
            _curIndex = _this.curIndex,
            _pIndex = (_curIndex - 1) < 0 ? (_aryImgs.length - 1) : (_curIndex - 1),
            _nIndex = (_curIndex + 1) > (_aryImgs.length - 1) ? 0 : (_curIndex + 1);

        for (var i = 0; i < _aryImgs.length; i++) {
            if (i == _curIndex) {
                _aryImgs[_curIndex].SetVisible(true);
                _aryImgs[_curIndex].SetLocation();
            } else if (i == _pIndex) {
                _aryImgs[_pIndex].SetLocation(-_this._imgContainerW);
            } else if (i == _nIndex) {
                _aryImgs[_nIndex].SetLocation(_this._imgContainerW);
            } else {
                _aryImgs[i].SetLocation(_this._imgContainerW);
            }
        }

        return true;
    }

    ImageViewer.prototype.__reInitThumbnailControlPosition = function () {
        var _this = this,
            l, t, i;

        _this.__initThumbnailControlsSize();

        l = _this.ThumbnailImageMargin;
        t = _this.ThumbnailImageMargin;

        for (i = 0; i < _this.aryThumbnailControls.length; i++) {
            var thumbnailControl = _this.aryThumbnailControls[i],
                bindIndex = thumbnailControl.cIndex;

            // 避免不必要的操作
            if (thumbnailControl._width != _this.ThumbnailControlW || thumbnailControl._height != _this.ThumbnailControlH) {
                thumbnailControl.ChangeControlSize(_this.ThumbnailControlW, _this.ThumbnailControlH);
            }

            thumbnailControl.SetLocation(l, t);

            // 重新计算 thumbnailContainer 的宽度
            _this._thumbnailsDiv.style.height = (t + thumbnailControl.GetControlHeight()) + 'px';
            _this._thumbnailContainer.scrollTop = _this._thumbnailContainer.scrollHeight;

            t = thumbnailControl.Top + _this.ThumbnailControlH + _this.ThumbnailImageMargin;
            l = _this.ThumbnailImageMargin;

            // 检查 index 是否有效
            if (bindIndex < 0 || bindIndex >= _this.aryThumbnailControls.length) {
                thumbnailControl.ClearControl();
                continue;
            }
        }
    };

    ImageViewer.prototype.__initThumbnailControlsSize = function () {
        //计算 Thumbnail 控件的 _this.ThumbnailControlW;  _this.ThumbnailControlH; 
        var _this = this,
            iTotalWidth, iTotalHeight;

        iTotalWidth = _this._thumbnailContainerW - _this.ThumbnailImageMargin;
        iTotalHeight = _this._thumbnailContainerH - _this.ThumbnailImageMargin;

        if (_this.aryThumbnailControls.length > _this.thumbnailImagesPerRow) {
            _this.ThumbnailControlW = iTotalWidth - _this.ThumbnailImageMargin - 15;
            _this.ThumbnailControlH = iTotalHeight / _this.thumbnailImagesPerRow - _this.ThumbnailImageMargin;
        } else {
            _this.ThumbnailControlW = iTotalWidth - _this.ThumbnailImageMargin;
            _this.ThumbnailControlH = iTotalHeight / _this.thumbnailImagesPerRow - _this.ThumbnailImageMargin;
        }
    };

    ImageViewer.prototype.__setCanvasVisible = function (v) {
        var _this = this;
        if (v) {
            _this._canvas.style.display = '';
        } else {
            _this._canvas.style.display = 'none';
        }
    }

    ImageViewer.prototype.__pushStack = function (funName) {
        var _this = this;
        var _curStack = {
            fun: funName,
            crop: _this.__getFinalCropArea()[0],
            draw: _this.__getFinalCropArea()[1],
            transform: $(_this._canvas).getTransform(),
            srcBlob: _this.aryImageControls[_this.curIndex].imageUrl
        };

        _this.stack.push(_curStack);
        _this.curStep++;
        return true;
    }

    ImageViewer.prototype.__getFinalCropArea = function () {
        var _this = this,
            img = _this.aryImageControls[_this.curIndex].objImage,
            imgOW = img.naturalWidth || img.width,
            imgOH = img.naturalHeight || img.height,
            curStack = _this.stack[_this.curStep],
            curCrop = curStack.crop,
            curTsf = curStack.transform,
            newCrop = _this.ImageAreaSelector.__getCropArea(),
            finalCrop = {
                x: curCrop.x,
                y: curCrop.y,
                width: curCrop.width,
                height: curCrop.height
            };

        if (0 != curTsf.a * curTsf.d && 0 == curTsf.b * curTsf.c) {
            if (newCrop) {
                if (1 == curTsf.a) {
                    finalCrop.x += newCrop.x * curCrop.width;
                } else {
                    finalCrop.x += (1 - newCrop.x - newCrop.width) * curCrop.width;
                }
                if (1 == curTsf.d) {
                    finalCrop.y += newCrop.y * curCrop.height;
                } else {
                    finalCrop.y += (1 - newCrop.y - newCrop.height) * curCrop.height;
                }
                finalCrop.width *= newCrop.width;
                finalCrop.height *= newCrop.height;
            }
        } else {
            if (newCrop) {
                if (1 == curTsf.b) {
                    finalCrop.x += newCrop.y * curCrop.width;
                } else {
                    finalCrop.x += (1 - newCrop.y - newCrop.height) * curCrop.width;
                }
                if (1 == curTsf.c) {
                    finalCrop.y += newCrop.x * curCrop.height;
                } else {
                    finalCrop.y += (1 - newCrop.x - newCrop.width) * curCrop.height;
                }
                finalCrop.width *= newCrop.height;
                finalCrop.height *= newCrop.width;
            }
        }
        // set proper accuracy
        var img = _this.aryImageControls[_this.curIndex];
        var accuracy = Math.pow(10, Math.ceil(Math.max(img._origImageWidth, img._origImageHeight)).toString().length + 2);
        finalCrop.x = Math.round(finalCrop.x * accuracy) / accuracy;
        finalCrop.y = Math.round(finalCrop.y * accuracy) / accuracy;
        finalCrop.width = Math.round(finalCrop.width * accuracy) / accuracy;
        finalCrop.height = Math.round(finalCrop.height * accuracy) / accuracy;

        var finalDraw = {
            x: finalCrop.x * imgOW,
            y: finalCrop.y * imgOH,
            width: finalCrop.width * imgOW,
            height: finalCrop.height * imgOH
        }

        return [finalCrop, finalDraw];
    }

    ImageViewer.prototype.onNumChange = null;
    ImageViewer.prototype._updateNumUI = function () {
        lib.doCallbackNoBreak(this.onNumChange, [this.curIndex, this.aryImageControls.length]);
    }

    MBC.ImageViewer = ImageViewer;

})(Alvin.MBC.Lib, Alvin.MBC);