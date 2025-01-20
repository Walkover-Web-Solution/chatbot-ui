export enum SdkIntegration {
    Web = 'Web',
    MobileSdk = 'Mobile SDK',
}

export enum MobileSdkIntegration {
    React = 'React Native',
    Flutter = 'Flutter',
}

export const CHAT_SCRIPT_CONFIG = `var helloConfig = {
  widgetToken: "{chat.token}",{user_jwt_token_data}
  hide_launcher: <true|false>, // override default widget hide launcher settings
  show_widget_form: <true|false>, // override default widget show client form settings
  show_close_button: <true|false>, // override default show close button widget settings
  launch_widget: <true|false>, // override default launch widget settings
  show_send_button: <true|false>, // override default show send button widget settings
  unique_id: <unique_id>, // any unique id, could be username, email etc.
  name: <name>,  // optional, if not passed in code, a form will be displayed
  number: <number>, // optional, if not passed in code, a form will be displayed
  mail: <mail>, // optional, if not passed in code, a form will be displayed{params}
  bot_position_align: <'left'|'right'>,
  bot_position_bottom: <bot_position_bottom>
};`;

export const CHAT_SCRIPT_JS = `
<script type="text/javascript">
  ${CHAT_SCRIPT_CONFIG}
;
</script>
<script type="text/javascript" onload="initChatWidget(helloConfig, 5000)" src="{chat.js}"> </script> // If you want to load widget with a delay, can pass 2nd param for delay in milliseconds`.trim();

export const INSTALL_REACT = `npm install @msg91comm/react-native-hello-sdk`;

export const DEPENDENCIES_JSON = `"cobrowse-sdk-react-native": "^2.13.0",
"react-native-webview": "^11.23.1"`;

export const DEPENDENCIES_CODE = `"dependencies": {
    "react": "18.1.0",
    "react-native": "0.70.5",
    "@msg91comm/react-native-hello-sdk": "^1.0.0",
    "cobrowse-sdk-react-native": "^2.13.0",
    "react-native-webview": "^11.23.1"
}`;

export const IMPORT_CHAT = `import ChatWidget from '@msg91comm/react-native-hello-sdk';`;

export const CHAT_WIDGET = `var helloConfig = {
    widgetToken: "{chat.token}",
    unique_id: <unique_id>, 
    name: <name>,  
    number: <number>,
    mail: <mail>
}`;

export const NAVIGATION_CONTAINER = `return (
  <NavigationContainer>
    {/* Other Screens or Navigation Stacks... */}
    <ChatWidget
       preLoaded={true}
       widgetColor={'#FFFF00'}
       helloConfig={helloConfig}
    />
  </NavigationContainer>
);`;

export const DEVICE_EVENT_EMITTER = `import { DeviceEventEmitter } from 'react-native';`;

export const BUTTON_EVENT_EMITTER = `<Button title="Chat with us"
    onPress={() => DeviceEventEmitter.emit("showHelloWidget", { status: true })}
/>`;

export const WIDGET_ON_SCRIPT = `import { DeviceEventEmitter } from 'react-native';
import ChatWidget from '@msg91comm/react-native-hello-sdk';`;

export const CONFIG_OBJECT = `var helloConfig = {
    widgetToken: "{chat.token}",
    unique_id: <unique_id>, 
    name: <name>,  
    number: <number>,
    mail: <mail>
}`;

export const CHAT_WIDGET_CONTENT = `return (
  <SafeAreaView>
    {/* Your Screen Code... */}
    <Button title="Chat with us"
      onPress={() => DeviceEventEmitter.emit("showHelloWidget", { status: true })}
    />
    {/* Your Screen Code... */}
    <ChatWidget
       preLoaded={true} 
       widgetColor={'#FFFF00'}
       helloConfig={helloConfig}
    />
  </SafeAreaView>
);`;

// Flutter SDK start
export const INSTALL_FLUTTER = `flutter pub add hello_flutter_sdk`;

export const IMPORT_FLUTTER = `import 'package:flutter/material.dart';
import 'package:hello_flutter_sdk/hello_flutter_sdk.dart';`;

export const FLUTTER_SCRIPT = `class _MyHomePageState extends State<MyHomePage> {
  //Initialize the chat widget height,width and position.
  double viewHeight = 80;
  double viewWidth = 80;
  double bottomPosition = 10;
  double rightPosition = 0;
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          bottom: bottomPosition,
          right: rightPosition,
          child: SizedBox(
            height: viewHeight,
            width: viewWidth,
            child: ChatWidget(
              //You can create your custom button  
              button: Container(
                height: 80,
                width: 80,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.red,
                      Colors.black,
                    ],
                  ),
                ),
                child: const Center(
                  child: Text(
                    "Chat",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),
              ),
              widgetToken: "{chat.token}",
              uniqueId: <unique_id>, //(Optional)
              name: <name>, //(Optional)
              widgetColor: const Color.fromARGB(255, 209, 58, 12),
              onLaunchWidget: () {
                // set the view height/width to full height/width of the screen
                setState(() {
                  viewHeight = MediaQuery.of(context).size.height;
                  viewWidth = MediaQuery.of(context).size.width;
                  bottomPosition = 0;
                  rightPosition = 0;
                });
              },
              onHideWidget: () {
                // set the button height/width on the screen
                setState(() {
                  viewHeight = 80;
                  viewWidth = 80;
                  bottomPosition = 10;
                  rightPosition = 0;
                });
              },
            ),
          ),
        ),
      ],
    );
  }
}`;
