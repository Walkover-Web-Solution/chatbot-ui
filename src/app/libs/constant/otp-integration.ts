export enum Integration {
    WebDefaultUi = 'webDefaultUi',
    WebCustomUi = 'webCustomUi',
    MobileDefaultUi = 'mobileDefaultUi',
    MobileCustomUi = 'mobileCustomUi',
}

export enum MobileSdk {
    ReactNative = 'reactNative',
    flutter = 'flutter',
    Swift = 'swift',
    Kotlin = 'kotlin',
    Jenkins = 'jenkins',
}

export const WIDGET_SCRIPT_CONFIG = `var configuration = {
  widgetId: "{widgetId}",
  tokenAuth: "{token}",
  identifier: "<enter mobile number/email here> (optional)",
  exposeMethods: "<true | false> (optional)",  // When true will expose the methods for OTP verification. Refer 'How it works?' for more details
  success: (data) => {
      // get verified token in response
      console.log('success response', data);
  },
  failure: (error) => {
      // handle error
      console.log('failure reason', error);
  },
::templateVariables
};`;

export const WIDGET_SCRIPT_JS = (environment: any) =>
    `${environment.server}${environment.env === 'prod' ? '/app' : '/email'}/assets/otp-provider/otp-provider.js`;
export const AUTH_VERIFY_API = (environment: any) => `${environment.server}/api/v5/widget/verifyAccessToken`;

export const WIDGET_SCRIPT_CONFIG_CUSTOM = `var configuration = {
    widgetId: "{widgetId}",
    tokenAuth: "{token}",
    identifier: "<enter mobile number/email here> (optional)",
    exposeMethods: true,
    captchaRenderId: '', // id(must be unique) of html element where to render captcha, only works if there is exposedMethod is true,.
    success: (data) => {
        // get verified token in response
        console.log('success response', data);
    },
    failure: (error) => {
        // handle error
        console.log('failure reason', error);
    },
::templateVariablesCustom
};`;

// export const MOBILE_SDK = `return (
//     <SafeAreaView style={styles.container}>
//     <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
//       <Text>Login With OTP</Text>
//     </TouchableOpacity>

//     <Modal visible={isModalVisible}>
//       <OTPVerification
//         onVisible={isModalVisible}
//         onCompletion={(data) => {
//           console.log(data)                       // Get your response of success/failure.
//           setModalVisible(false)
//         }}
//         authToken={authToken}   // Get authToken from MSG91 OTP Tokens
//         widgetId={widgetId}     // Get widgetId from MSG91 OTP Widget Configuration
//       />
//     </Modal>
//   </SafeAreaView>
// );`;

export const MOBILE_SDK_CSS = `
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  button: {
    backgroundColor: '#C0EDD2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 14
  },
});
`;

// for default mobile SDK
// export const REACT_NATIVE_IMPORT = `import React, { useState } from 'react';
// import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { OTPVerification } from '@msg91comm/react-native-sendotp';`;

export const SEND_OTP_METHOD_ARGUMENT = `// example: email as identifier
window.sendOtp(
  'test@gmail.com', // mandatory
  (data) => console.log('OTP sent successfully.'), // optional
  (error) => console.log('Error occurred') // optional
);

// example: mobile number as identifier
window.sendOtp(
  '919999999999', // mandatory
  (data) => console.log('OTP sent successfully.'),
  (error) => console.log('Error occurred')
);
`;
export const RETRY_OTP_METHOD_ARGUMENT = `// Default configuration
window.retryOtp(
  null, // channel value mandatory
  (data) => console.log('resend data: ', data), // optional
  (error) => console.log(error), // optional
  '336870744532313134323444' // optional
);

// Custom configuration
window.retryOtp(
  '11', // channel value mandatory
  (data) => console.log('resend data: ', data), // optional
  (error) => console.log(error), // optional
  '336870744532313134323444' // optional
);
`;

export const VERIFY_OTP_METHOD_ARGUMENT = `// For example
window.verifyOtp(
  123456, // OTP value
  (data) => console.log('OTP verified: ', data), // optional
  (error) => console.log(error), // optional
  '336870744532313134323444' // optional
);
`;

export const CONFIG_OTP_METHOD_ARGUMENT = `var configuration = {
    exposeMethods: true,
    success: (data) => {
      // You can ignore listening to this if the verifyOtp method's success is listened
      console.log('success response', data);
    },
    failure: (error) => {
      // You can ignore listening to this if verifyOtp method's failure is listened
      console.log('failure reason', error);
    },
  };
`;

export const GET_WIDGET_DATA = `var widgetData = window.getWidgetData();
console.log('Widget Data:', widgetData);
`;

export const IS_CAPTCHA_VERIFIED = `var isCaptchaVerified = window.isCaptchaVerified();
console.log('Captcha is verified or not', isCaptchaVerified);
`;

export const SERVER_SIDE_INTEGRATION = (environment: any) => `curl --location --request POST '${AUTH_VERIFY_API(
    environment
)}' \n --header 'Content-Type: application/json' \n --data-raw '{
    "authkey": "{authkey}",
    "access-token": "{jwt_token_from_otp_widget}" \n}'`;

// for custom mobile SDK
export const REACT_NATIVE_CUSTOM_IMPORT = `import React, { useEffect } from 'react';
import { OTPWidget } from '@msg91comm/sendotp-react-native';`;

export const MOBILE_CUSTOM_SDK = `
const widgetId = {widgetId};
const tokenAuth = {authToken};

const App = () => {
    useEffect(() => {
        OTPWidget.initializeWidget(widgetId, tokenAuth); //Widget initialization
    }, [])

    const [number, setNumber] = useState('');

    const handleSendOtp = async () => {
        const data = {
            identifier: '91758XXXXXXX'
        }
        const response = await OTPWidget.sendOTP(data);
        console.log(response);  
    }

    return (
        <View>
            <TextInput
                placeholder='Number'
                value={number}
                keyboardType='numeric'
                style={{ backgroundColor: '#ededed', margin: 10 }}
                onChangeText={(text) => {
                    setNumber(text)
                }}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={()=>{
                    handleSendOtp()
                }}
            >
                <Text>
                    Send OTP
                </Text>
            </TouchableOpacity>
        </View>
    );
}
    
export default App;`;

export const REACT_NATIVE_SEND = `
const handleSendOtp = async () => {
  const data = {
    identifier: '91758XXXXXXX'
  }
  const response = await OTPWidget.sendOTP(data);
  console.log(response);
}`;

export const REACT_NATIVE_SEND_OR = `
const handleSendOtp = async () => {
  const data = {
    identifier: 'alpha@gmail.com'
  }
  const response = await OTPWidget.sendOTP(data);
  console.log(response);
}`;

export const REACT_NATIVE_RETRY_OTP = `
const handleRetryOtp = async () => {
   const body = {
        reqId: '3463***************43931',
        retryChannel: 11 // Retry channel code (here, SMS:11)
  }
  const response = await OTPWidget.retryOTP(body);
  console.log(response);
}`;

export const REACT_NATIVE_VERIFY_OTP = `
const handleVerifyOtp = async () => {
  const body = {
        reqId: '3463***************43931',
        otp: '****'
  }
  const response = await OTPWidget.verifyOTP(body);
  console.log(response);
}`;

// for Kotlin
export const KOTLIN_DEPENDENCIE = `
dependencies {
    implementation("com.msg91.lib:sendotp:1.0.0")
}`;
export const KOTLIN_IMPORT = `
private fun handleSendOTP() {
    val widgetId = "{widgetId}";
    val tokenAuth = "{authToken}";

    val identifier = '91758XXXXXXX'; // or 'example@xyz.com'
    
    coroutineScope.launch {
        try {

            val result = withContext(Dispatchers.IO) {
                OTPWidget.sendOTP(widgetId, tokenAuth, identifier)
            }
            println("Result: $result")

        } catch (e: Exception) {
            println("Error in SendOTP")
        }
    }
}`;

export const KOTLIN_RETRY = `
private fun handleRetryOTP(channel: Number) {
    coroutineScope.launch {
        try {

            val result = withContext(Dispatchers.IO) {
                OTPWidget.retryOTP(widgetId, tokenAuth, reqId, channel)
            }
            println("Result: $result")

        } catch (e: Exception) {
            println("Error in RetryOTP")
        }
    }
}`;
export const KOTLIN_VERIFY = `
private fun handleVerifyOtp() {

    val otp = '****';
    coroutineScope.launch {
        try {

            val result = withContext(Dispatchers.IO) {
                OTPWidget.verifyOTP(widgetId, tokenAuth, reqId, otp)
            }
            println("Result: $result")

        } catch (e: Exception) {
            println("Error in VerifyOTP")
        }
    }
}`;

export const KOTLIN_WIDGET_PROCESS = `
private fun getWidgetProcess() {
    coroutineScope.launch {
        try {

            val result = withContext(Dispatchers.IO) {
                OTPWidget.getWidgetProcess(widgetId, tokenAuth)
            }
            println("Widget Data: $result")

        } catch (e: Exception) {
            println("Error in GetWidgetData")
        }
    }
}`;

export const FLUTTER_CUSTOM_IMPORT = `import 'package:flutter/material.dart';
import 'package:otp_widget/otp_widget.dart';`;

export const FLUTTER_CUSTOM_SDK = `
void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: OTPExample(),
    );
  }
}

class OTPExample extends StatefulWidget {
  @override
  _OTPExampleState createState() => _OTPExampleState();
}

class _OTPExampleState extends State<OTPExample> {
  final String widgetId = '{widgetId}';  // Your widgetId
  final String authToken = '{token}'; // Your authToken

  String phoneNumber = '';
  
  @override
  void initState() {
    super.initState();
    OTPWidget.initializeWidget(widgetId, authToken); // Initialize widget
  }

  // Method to send OTP
  Future<void> handleSendOtp() async {
    final data = {'identifier': '91758XXXXXXX'};
    final response = await OTPWidget.sendOTP(data);
    print(response); // Handle response
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Send OTP Example'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              decoration: InputDecoration(labelText: 'Enter phone number'),
              onChanged: (value) {
                setState(() {
                  phoneNumber = value;
                });
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: handleSendOtp,
              child: Text('Send OTP'),
            ),
          ],
        ),
      ),
    );
  }
}`;

export const FLUTTER_SEND = `
Future<void> handleSendOtp() async {
  final data = {
    'identifier': '91758XXXXXXX'  // Phone number or email
  };
  final response = await OTPWidget.sendOTP(data);
  print(response);  // Handle response
}`;

export const FLUTTER_SEND_OR = `
Future<void> handleSendOtp() async {
  final data = {
    'identifier': 'example@mail.com'  // Phone number or email
  };
  final response = await OTPWidget.sendOTP(data);
  print(response);  // Handle response
}`;

export const FLUTTER_RETRY_OTP = `
Future<void> handleRetryOtp() async {
  final data = {
    'reqId': '3463***************43931',  // Request ID
    'retryChannel': 11  // Retry via SMS
  };
  final response = await OTPWidget.retryOTP(data);
  print(response);  // Handle response
}`;

export const FLUTTER_VERIFY_OTP = `
Future<void> handleVerifyOtp() async {
  final data = {
    'reqId': '3463***************43931',  // Request ID
    'otp': '****'  // OTP entered by the user
  };
  final response = await OTPWidget.verifyOTP(data);
  print(response);  // Handle response
}`;
