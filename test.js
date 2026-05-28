let parsedata={}

const generateRandomString = (length) =>
  Array.from({ length }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      .charAt(Math.floor(Math.random() * 62))
  ).join('');

parsedata.paylaod={
  type : "plugin", title, orderGroup, stepId, actionId, iconUrl, configurationJson, configurationJsonEncrypted };

parsedata.apiURL=`${baseUrl}/scripts/${projectId}/${scriptId}/stepv2`
parsedata.updateApiURL=`${baseUrl}/scripts/${scriptId}/stepv2/${title}`
parsedata.proxy_auth_token=proxy_auth_token
parsedata.project_id=projectId
parsedata.operation = operation

if(operation=='CREATE'){
  const newIdentifier = generateRandomString(8);
    parsedata.paylaod.stepId = `func${newIdentifier}`
  
}
parsedata.paylaod.iconUrl = context.res.get_icon_of_serice?.data?.data?.rows?.[0]?.iconurl
return parsedata



let parsedata={}

const generateRandomString = (length) =>
  Array.from({ length }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      .charAt(Math.floor(Math.random() * 62))
  ).join('');

parsedata.paylaod={
  type : "plugin", title, orderGroup, actionId,configurationJson:"",configurationJsonEncrypted:""};

parsedata.apiURL=`${baseUrl}/scripts/${projectId}/${scriptId}/stepv2`
parsedata.updateApiURL=`${baseUrl}/scripts/${scriptId}/stepv2/${title}`
parsedata.proxy_auth_token=proxy_auth_token
parsedata.project_id=projectId

// if(operation=='CREATE'){
//   const newIdentifier = generateRandomString(8);
//     parsedata.paylaod.stepId = `func${newIdentifier}`
  
// }
const newIdentifier = generateRandomString(8);
parsedata.paylaod.stepId = `func${newIdentifier}`

parsedata.paylaod.iconUrl = context.res.get_icon_of_serice?.data?.data?.rows?.[0]?.iconurl
return parsedata