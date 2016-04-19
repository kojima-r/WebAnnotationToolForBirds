var Util = (function () {
    function Util() {
    }
    /// ArrayBuffer から String への変換
    Util.ArrayBufferToString = function (buffer) {
        return this.BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
    };
    /// String から ArrayBuffer への変換
    Util.StringToArrayBuffer = function (string) {
        return this.StringToUint8Array(string).buffer;
    };
    /// 
    Util.basename = function (path) {
        return path.replace(/\\/g, '/').replace(/.*\//, '');
    };
    Util.dirname = function (path) {
        return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    };
    Util.getExtention = function (fileName) {
        var ret;
        if (!fileName) {
            return ret;
        }
        var fileTypes = fileName.split(".");
        var len = fileTypes.length;
        if (len === 0) {
            return ret;
        }
        ret = fileTypes[len - 1];
        return ret;
    };
    ///補助関数
    Util.BinaryToString = function (binary) {
        var error;
        try {
            return decodeURIComponent(encodeURIComponent(binary));
        }
        catch (_error) {
            error = _error;
            if (error instanceof URIError) {
                return binary;
            }
            else {
                throw error;
            }
        }
    };
    Util.StringToBinary = function (string) {
        var chars, code, i, isUCS2, len, _i;
        len = string.length;
        chars = [];
        isUCS2 = false;
        for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
            code = String.prototype.charCodeAt.call(string, i);
            if (code > 255) {
                isUCS2 = true;
                chars = null;
                break;
            }
            else {
                chars.push(code);
            }
        }
        if (isUCS2 === true) {
            return encodeURIComponent(string);
        }
        else {
            return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
        }
    };
    Util.StringToUint8Array = function (string) {
        var binary, binLen, buffer, chars, i, _i;
        binary = this.StringToBinary(string);
        binLen = binary.length;
        buffer = new ArrayBuffer(binLen);
        chars = new Uint8Array(buffer);
        for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
            chars[i] = String.prototype.charCodeAt.call(binary, i);
        }
        return chars;
    };
    return Util;
})();
//# sourceMappingURL=util.js.map