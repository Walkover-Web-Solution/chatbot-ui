// https://github.com/danxexe/sms-counter Package Use for SMS counter by PHP
const gsm7bitChars =
    '@£$¥èéùìòÇ\\nØø\\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\\"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const gsm7bitExChar = '\\^{}\\\\\\[~\\]|€';
const gsm7bitRegExp = RegExp('^[' + gsm7bitChars + ']*$');
const gsm7bitExRegExp = RegExp('^[' + gsm7bitChars + gsm7bitExChar + ']*$');
const gsm7bitExOnlyRegExp = RegExp('^[\\' + gsm7bitExChar + ']*$');
const GSM_7BIT = 'GSM_7BIT';
const GSM_7BIT_EX = 'GSM_7BIT_EX';
const UTF16 = 'UTF16';

export const SMS_COUNTER = function (text: string) {
    var count, encoding, length, messages, per_message, remaining;
    encoding = detectEncoding(text);
    length = text.length;
    if (encoding === GSM_7BIT_EX) {
        length += countGsm7bitEx(text);
    }
    per_message = encoding === GSM_7BIT ? 160 : encoding === GSM_7BIT_EX ? 160 : 70;
    if (length > per_message) {
        per_message = encoding === GSM_7BIT ? 153 : encoding === GSM_7BIT_EX ? 153 : 67;
    }
    messages = Math.ceil(length / per_message);
    remaining = per_message * messages - length;
    if (remaining == 0 && messages == 0) {
        remaining = per_message;
    }
    return (count = {
        encoding: encoding,
        length: length,
        per_message: per_message,
        remaining: remaining,
        messages: messages,
    });
};

let detectEncoding = function (text: string) {
    switch (false) {
        case text.match(gsm7bitRegExp) == null:
            return GSM_7BIT;
        case text.match(gsm7bitExRegExp) == null:
            return GSM_7BIT_EX;
        default:
            return UTF16;
    }
};

let countGsm7bitEx = function (text: string) {
    var char2, chars;
    chars = function () {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = text.length; _i < _len; _i++) {
            char2 = text[_i];
            if (char2.match(gsm7bitExOnlyRegExp) != null) {
                _results.push(char2);
            }
        }
        return _results;
    }.call(() => {});
    return chars.length;
};
