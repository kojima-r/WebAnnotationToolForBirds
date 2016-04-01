class  Util {
    /// ArrayBuffer から String への変換
    public static ArrayBufferToString(buffer) {
        return this.BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
    }
    /// String から ArrayBuffer への変換
    public static StringToArrayBuffer(string) {
        return this.StringToUint8Array(string).buffer;
    }
    /// 
    public static basename(path) {
        return path.replace(/\\/g, '/').replace(/.*\//, '');
    }

    public static dirname(path) {
        return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    }
    public static getExtention(fileName) {
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
    }
    ///補助関数
    private static BinaryToString(binary) {
        var error;
        try {
            return decodeURIComponent(encodeURIComponent(binary));
        } catch (_error) {
            error = _error;
            if (error instanceof URIError) {
                return binary;
            } else {
                throw error;
            }
        }
    }

    private static StringToBinary(string) {
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
            } else {
                chars.push(code);
            }
        }
        if (isUCS2 === true) {
            return encodeURIComponent(string);
        } else {
            return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
        }
    }

    private static StringToUint8Array(string) {
        var binary, binLen, buffer, chars, i, _i;
        binary = this.StringToBinary(string);
        binLen = binary.length;
        buffer = new ArrayBuffer(binLen);
        chars = new Uint8Array(buffer);
        for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
            chars[i] = String.prototype.charCodeAt.call(binary, i);
        }
        return chars;
    }

}