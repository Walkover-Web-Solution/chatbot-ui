export function convertChannelTypeResponse(apiResponse: any, prodEnv: boolean) {
    // if (prodEnv) {
    //     return apiResponse;
    // }
    return commonResponse(apiResponse);
}

export function convertConditionResponse(apiResponse: any, prodEnv: boolean) {
    // if (prodEnv) {
    //     return apiResponse;
    // }
    return commonResponse(apiResponse);
}

export function convertFieldsResponse(apiResponse: any, prodEnv: boolean) {
    // if (prodEnv) {
    //     return apiResponse;
    // }
    return {
        ...apiResponse,
        mapping: convertObjectToArray(apiResponse?.mapping),
    };
}

export function convertCampaignGetResponse(apiResponse: any, prodEnv: boolean) {
    // if (prodEnv) {
    //     return apiResponse;
    // }
    return {
        ...apiResponse,
        modules: campaignModuleResponse(apiResponse?.modules),
    };
}

export function convertCampaignPatchPayload(payload: any, prodEnv: boolean) {
    // if (prodEnv) {
    //     return payload;
    // }
    return {
        ...payload,
        configurations: convertArrayToObject(payload?.configurations),
    };
}

export function convertCampaignOneAPIPayload(payload: any, prodEnv: boolean) {
    // if (prodEnv) {
    //     return payload;
    // }
    return {
        ...payload,
        flowAction: {
            ...payload.flowAction,
            configurations: convertArrayToObject(payload?.flowAction?.configurations),
        },
    };
}

function commonResponse(apiResponse: any) {
    let response = [];
    for (let channelType of apiResponse) {
        let type = {
            ...channelType,
            configurations: convertConfigurationsData(channelType?.configurations),
        };
        response.push(type);
    }
    return response;
}

function convertConfigurationsData(configurations: any) {
    return {
        ...configurations,
        fields: convertObjectToArray(configurations?.fields),
        mapping: convertObjectToArray(configurations?.mapping),
    };
}

function campaignModuleResponse(modules: any) {
    let formattedResponse = {};
    for (let key in modules) {
        formattedResponse = {
            ...formattedResponse,
            [key]: campiagnModuleElement(modules[key]),
        };
    }
    return formattedResponse;
}

function campiagnModuleElement(elementsData: any) {
    let elements = {};
    for (let element in elementsData) {
        elements = {
            ...elements,
            [element]: {
                ...elementsData[element],
                configurations: convertObjectToArray(elementsData[element]?.configurations),
            },
        };
    }
    return elements;
}

function convertObjectToArray(objectData: any) {
    let response = [];
    if (Array.isArray(objectData)) {
        return objectData;
    }
    for (let key in objectData) {
        response.push(objectData[key]);
    }
    return response;
}

function convertArrayToObject(arrayData: any) {
    let response = {};
    if (!Array.isArray(arrayData)) {
        return arrayData;
    }
    for (let data of arrayData) {
        response = {
            ...response,
            [data.name]: data,
        };
    }
    return response;
}
