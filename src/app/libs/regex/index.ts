export const EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const COMMA_SEPARATED_URLS_REGEX = '((https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w.-]*/?(,)?)+$';
export const COMMA_SEPARATED_URLS_REGEX_HTTP_MANDATORY =
    '((https?://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w().-]*/?(\\?([\\w-]+(=[\\w-]*)?(&[\\w-]+(=[\\w-]*)?)*))?(,)?)+$';
export const ALPHANUMERIC_WITH_DASH_REGEX = /^[a-z0-9\-\_]+$/;
export const ALPHANUMERIC_WITH_DASH_AND_CAPS_REGEX = /^[A-Za-z0-9\-\_]+$/;
export const ALPHANUMERIC_WITHOUT_SPACE = /^[A-Za-z0-9]+$/;
export const ALPHANUMERIC_WITH_DASH_SPACE_REGEX = /^[A-Za-z0-9\-\_ ]+$/;
export const ALPHANUMERIC_WITH_UNDERSCORE_SPACE_REGEX = /^[A-Za-z0-9\_ ]+$/;
export const ALPHANUMERIC_WITH_SPACE_COMMA_REGEX = /^[A-Za-z0-9, ]+$/;
export const GTM_ID_REGEX = /^GTM-[A-Z0-9]+$/;
export const ONLY_INTEGER_REGEX = /^[0-9]*$/;
export const INTEGER_WITH_COMMA_REGEX = /^[0-9,]*$/;
export const DIAL_CODE_REGEX = /^\+[0-9]*$/;
export const WEB_REGEX = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;
export const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
export const DOMAIN_REGEX = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-z]{2,}$/;
export const IMAGE_EXTENSTION_REGEX = /^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(jpg|jpeg|png|gif)$/;
export const ALPHABET_WITH_SPACE_REGEX = /^[a-zA-Z ]*$/;
export const ALPHANUMERIC_WITH_SPACE_REGEX = /^[a-zA-Z0-9 ]*$/;
export const EMAIL_VALIDATION_REGEX_WITHOUT_DOMAIN =
    /^[a-zA-Z0-9._-](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const SLASH_SPACE_PREFIX_REGEX = /^(?!.*\/).*$/;
export const COLOR_CODE_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const VALUE_BTW_ZERO_TO_ONE_REGEX = /^(0(\.[1-9]+)?|1(\.0+)?)$/;
export const PHONE_NUMBER_REGEX = /^[0-9-+()\/\\ ]+$/;
export const NUMBER_UPTO_THREE_DECIMAL_REGEX = /^\d*\.?\d{0,3}$/;
export const CITY_NAME_REGEX = /^[A-Za-z ]{1,32}$/;
export const ADDRESS_REGEX = /^[a-zA-Z0-9()_\-\\\/,. ]*$/;
export const MOBILE_NUMBER_REGEX = /^[0-9]{7,15}$/;
export const GSTIN_REGEX = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
export const PIN_CODE_REGEX = /^[0-9 A-Z a-z -]{4,11}$/;
export const RCS_PHONE_NUMBER_REGEX = '^[+]?[0-9]+(.?[0-9]+)?$';
export const COMMA_PHONE_NUMBER_REGEX = '^([+]?[0-9]+(.?[0-9]+)((, )|,)?)+$';
export const COMMA_PHONE_NUMBER_WITHOUT_PLUS_REGEX = /^[0-9]+(?:,[0-9]+)*$/;
export const COMMA_EMAIL_REGEX = '^([a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}((, )|,)?)+$';
export const COMMA_URL_REGEX = '((https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?((, )|,)?)+$';
export const BOOLEAN_REGEX = '^(true|false)$';
export const DECIMAL_VALUE_REGEX = '^\\d+\\.?\\d{0,20}$';
export const ONLY_ALPHABETS_WITH_NO_CONSECUTIVE_UNDERSCORES_REGEX = '^([a-zA-Z]|[a-zA-Z]_(?=[a-zA-Z]))*$';
export const NO_SPECIAL_CHARACTER_REGEX = /^(?!\.)(?!.*?\.\.)[a-zA-Z.\s]+$/;
export const ONLY_ALPHABETS_SPACE_REGEX = /^[A-Za-z ]+$/;
export const ONLY_ALPHABETS_WITH_UNDERSCORES = /^([a-zA-Z]+_)*[a-zA-Z]+$/;
export const ALPHABETS_WITH_UNDERSCORES = /^[A-Za-z_]+$/;
export const WORDS_WITHOUT_SPECIAL_CHARACTER_ALLOW_UNDERSCORES = /^[\w]+$/;
export const MEDIA_URL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
export const IP_V4_V6_REGEX =
    /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/gm;
export const IP_V4_V6_WITH_OR_WITHOUT_CIDR_REGEX =
    /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}(?:\/([0-9]|[1-2][0-9]|3[0-2]))?$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?(?:\/(12[0-8]|1[01][0-9]|[1-9]?[0-9]))?$)/gm;
export const DATE_FORMAT_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
export const ALPHANUMERIC_WITH_UNDERSCORE_DOT_REGEX = /^[A-Za-z0-9\_\.]+$/;
export const ALPHANUMERIC_REGEX_WITH_AT_DOT_AND_HYPHEN = /^[A-Za-z0-9\@\-\.]+$/;
export const CONTENT_BETWEEEN_HASH_TAG_REGEX = /\#\#(.*?)\#\#/;
export const CONTENT_BETWEEEN_AT_REGEX = /\@(.*?)\@/;
export const CONTENT_BETWEEEN_CURLY_HASH_TAG_REGEX = /\{\#(.*?)\#\}/;
export const PERCENTAGE_UPTO_TWO_DECIMAL_REGEX = /^-?\d+(\.\d{1,2})?$/;
export const SEGMENTO_PHONE_NUMBER_REGEX = /^[+]?[0-9]+$/;
export const NON_LATIN_UNICODE_REGEX = /[^\u0000-\u00ff]/;
export const SMS_TEMPLATE_UNICODE_REGEX = /[^\t\r\n\x20-\x7E]/;
export const CONTENT_BETWEEEN_CURLY_BRACKETS_REGEX = /\{\{(.*?)\}\}/;
export const INTEGER_BETWEEEN_CURLY_BRACKETS_REGEX = /\{\{(\d+)\}\}/;
export const INTEGER_BETWEEEN_DOT_REGEX = /\.(\d+)\./;
export const START_WITH_ALPHABET = /^[a-zA-Z]/;
export const NO_SPACE_NEW_LINE_REGEX = /\\n|\\t|\\r|\s/;
export const EMAIL_DOMAIN_REGEX =
    /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/;
export const URL_REGEX = /^(http?|https):\/\/[^\s$.?#].[^\s]*$/;
export const BOT_CTA_URL_REGEX =
    /^(http?|https):\/\/[^\s$.?#].[^\s]*$|^mailto:(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|tel:\+?[0-9]{7,15}$/;
export const DOMAIN_SUBDOMAIN_REGEX = /((?:[a-z0-9-]+\.)*)([a-z0-9-]+\.[a-z]+)($|\s|\:\d{1,5})/;
export const ALPHANUMERIC_WITH_DASH_SPACE_AT_DOT_REGEX = /^[A-Za-z0-9@.\-\_ ]+$/;
export const ALPHANUMERIC_WITH_DASH_SPACE_COMMA_REGEX = /^[A-Za-z0-9,\-\_ ]+$/;
export const CAMPAIGN_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_\s]+$/;
export const ALPHANUMERIC_WITH_DASH_CAPS_AND_STARTS_WITH_ALPHABET_REGEX = /^[A-Za-z][A-Za-z0-9\-\_]*$/;
export const PERMISSION_NAME_REGEX = /^[a-zA-Z0-9_.\s]+$/;
export const NON_ASCII_PRINTABLE_CHARACTERS_REGEX = /[^\t\r\n\x20-\x7E]/;
export const FULL_NAME_REGEX = /^([\w])+\s+([\w\s])+$/i;
export const ALPHANUMERIC_WITH_UNDERSCORE_DOT_DASH_AT_THE_RATE_REGEX = /^[A-Za-z0-9\_\@\.\-\']+$/;
export const PROMPTS_REGEX_VERIFY = /^(?:[A-Za-z0-9]|(?:(?!{\d+,}|\\(?!u[A-Za-z0-9]{4})))[\(\)\,\-\[\]\{\|\}\\ ])*$/;
export const URL_WITH_DOMAIN_OR_IP_ADDRESS_REGEX =
    /^(http(?:s?):\/\/)((?:(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))|(?:(?:www\.)?[\w\.\-]+(?:\.[a-zA-Z]{2,6})+))(?:\:\d{1,5})?(\/[\w\-\s\.\/\?\%\#\&\=]*)?$/;
export const REDIRECTION_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const HELLO_INBOX_OPERATION = /\w+_inbox$/;
export const HEX_AND_RGB_COLOR_CODE_REGEX =
    '^rgba\\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3}),\\s*(1|0?\\.?\\d{0,2})\\)$|^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$';
export const validTlds =
    'com|edu|gov|net|mil|org|nom|sch|caa|res|off|gob|int|tur|ip6|uri|urn|asn|act|nsw|qld|tas|vic|pro|biz|adm|adv|agr|arq|art|ato|bio|bmd|cim|cng|cnt|ecn|eco|emp|eng|esp|etc|eti|far|fnd|fot|fst|g12|ggf|imb|ind|inf|jor|jus|leg|lel|mat|med|mus|not|ntr|odo|ppg|psc|psi|qsl|rec|slg|srv|teo|tmp|trd|vet|zlg|web|ltd|sld|pol|fin|k12|lib|pri|aip|fie|eun|sci|prd|cci|pvt|mod|idv|rel|sex|gen|nic|abr|bas|cal|cam|emr|fvg|laz|lig|lom|mar|mol|pmn|pug|sar|sic|taa|tos|umb|vao|vda|ven|mie|北海道|和歌山|神奈川|鹿児島|ass|rep|tra|per|ngo|soc|grp|plc|its|air|and|bus|can|ddr|jfk|mad|nrw|nyc|ski|spy|tcm|ulm|usa|war|fhs|vgs|dep|eid|fet|fla|flå|gol|hof|hol|sel|vik|cri|iwi|ing|abo|fam|gok|gon|gop|gos|aid|atm|gsm|sos|elk|waw|est|aca|bar|cpa|jur|law|sec|plo|www|bir|cbg|jar|khv|msk|nov|nsk|ptz|rnd|spb|stv|tom|tsk|udm|vrn|cmw|kms|nkz|snz|pub|fhv|red|ens|nat|rns|rnu|bbs|tel|bel|kep|nhs|dni|fed|isa|nsn|gub|e12|tec|орг|обр|упр|alt|nis|jpn|mex|ath|iki|nid|gda|inc'.split(
        '|'
    );
export const URL_WITH_HTTP_HTTPS_UPI_REGEX = /^(https?|upi):\/\/[^\s$.?#].[^\s]*$/;
export const NO_EMOJIS_REGEX = /^((?!\p{Extended_Pictographic}).)*$/gu;
export const MEDIA_BASE64_DATA_URL = /^data:((?:\w+\/(?:(?!;).)+)?)((?:;[\w\W]*?[^;])*),(.+)$/;
export const INTENT_NAME_REGEX = /^[0-9a-zA-Z](?!.*__)[0-9a-zA-Z_-]{0,90}$/;
export const EMAIL_VALIDATION_ALLOWED_SPECIAL_CHARACTER_REGEX_WITHOUT_DOMAIN =
    /^(?:(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*)|(?:".+"))$/;
export const OTP_WIDGET_MAGIC_LINK_URL = /^(https?:\/\/)?[^\s\/$.?#].[^\s]*\{\{magicToken\}\}[^\s]*$/;
