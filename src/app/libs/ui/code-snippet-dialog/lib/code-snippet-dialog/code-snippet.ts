// import * as env from '../../../../../../apps/msg91/src/environments/environment';
// const urlToShow = env.environment.server + '' + env.environment.campaignProxy + '/campaigns/:id/run';
const urlToShow = 'https://control.msg91.com/api/v5/campaign/api/campaigns/:id/run';

export const curlSnippet = `
curl --location --request POST
  '${urlToShow}'
  --header 'Content-Type: application/json'
  --header ':headerType: :headerValue'
  --data-raw '{
    "data"::data
    :action
  }'
`;

export const javaScriptSnippet = `
  const url = new URL(
    ${urlToShow}
  );

  let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ":headerType": ":headerValue"
  };

  let body = {
    "data"::data
    :action
  }

  fetch(url, {
      method: "POST",
      headers: headers,
      body:  JSON.stringify(body)
  })
  .then(response => response.json())
  .then(json => console.log(json));
`;

export const phpSnippetGuzzle = `
  $client= new \GuzzleHttp\Client();

  $response=$client->request(
    'POST',
    '${urlToShow}',
    'headers'=>[
      'Content-Type'=>'application/json',
      'Accept'=>'application/json',
      ':headerType': ':headerValue'
    ],

    'json'=>[
      'data': [
        :data
      ]:action
    ]
  );
  $body=$response->getBody();
  print_r(json_decode((string)$body));
`;

export const phpSnippetCurl = `
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => '${urlToShow}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "data"::data
    :action
  }',
  CURLOPT_HTTPHEADER => array(
    'Content-Type'=> 'application/json',
    'Accept'=>'application/json',
    ':headerType'=>':headerValue',
  ),
));
$response = curl_exec($curl);
curl_close($curl);
echo $response;
`;

export function returnSnippet() {
    return [
        {
            platform: 'Curl',
            snippet: curlSnippet,
        },
        {
            platform: 'Java Script',
            snippet: javaScriptSnippet,
        },
        {
            platform: 'PHP',
            snippet: phpSnippetCurl,
        },
    ];
}
