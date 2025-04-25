// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import WebhookIcon from "@mui/icons-material/Webhook";
// import {
//   Autocomplete,
//   Box,
//   Button,
//   Checkbox,
//   Divider,
//   Fab,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
// } from "@mui/material";
// import copy from "copy-to-clipboard";
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { infoToast } from "../../../../components/customToast";
// import { ParamsEnums } from "../../../../enums";
// import addUrlDataHoc from "../../../../hoc/addUrlDataHoc.tsx";
// import {
//   setConfigModalState,
//   updateInterfaceActionStart,
//   updateInterfaceFrontendActionStart,
// } from "../../../../store/interface/interfaceSlice.ts";
// import { $ReduxCoreType } from "../../../../types/reduxCore.ts";
// import { useCustomSelector } from "../../../../utils/deepCheckSelector";
// import {
//   DataforComponents,
//   allowedProps,
//   isJSONString,
// } from "../../utils/InterfaceUtils.ts";
// import "./componentConfigs.scss";
// import { generateNewId } from "../../../../utils/utilities";
// import { createScripts } from "../../../../api/InterfaceApis/InterfaceApis.ts";

// function ComponentToTakePropValue({
//   propName,
//   componentConfig = {},
//   handleChange = null,
//   setActionType = null,
//   orgId,
//   projectId,
//   chatbotId,
//   actionElement,
//   actionKey,
//   key,
// }: {
//   propName: string;
//   componentConfig: { [key: string]: any } | any;
//   componentActions: { [key: string]: any } | any;
//   handleChange: ((value: string, propName: string) => void) | null;
//   setActionType: any;
//   orgId: string;
//   projectId: string;
//   chatbotId: string;
//   actionElement: any;
//   actionKey: string;
//   key: string;
// }) {
//   const newId = ((Date.now() / 1000) * 1000)?.toString();
//   const dispatch = useDispatch();
//   const currentSelectedComponent = useCustomSelector(
//     (state: $ReduxCoreType) => state?.Interface?.currentSelectedComponent
//   );
//   const { gridId, componentType, componentId } = currentSelectedComponent || {};
//   const actionData = useCustomSelector(
//     (state: $ReduxCoreType) =>
//       state?.Interface?.interfaceData?.[chatbotId]?.actions?.[gridId]?.[
//         componentId
//       ]
//   );
//   const [isNavigateCheck, setNavigateCheck] = useState(false);
//   const [url, setUrl] = useState("");

//   if (allowedProps[propName] === "boolean")
//     return (
//       <Checkbox
//         checked={componentConfig[propName] || false}
//         onChange={(e) => handleChange(e.target.checked, propName)}
//       />
//     );

//   switch (propName) {
//     case "key": {
//       const copyComponentId = () => {
//         copy(currentSelectedComponent?.componentId || "");
//         infoToast("Copied to clipboard");
//       };
//       return (
//         <Box className="flex-center-center gap-1 w-100  p-1 box-sizing-border-box">
//           <TextField
//             value={currentSelectedComponent?.componentId || ""}
//             fullWidth
//             disabled
//           />
//           <ContentCopyIcon color="primary" onClick={copyComponentId} />
//         </Box>
//       );
//     }
//     case "options": {
//       return (
//         <Box className="w-100" key={key}>
//           <Autocomplete
//             multiple
//             id="tags-standard"
//             freeSolo
//             options={[]}
//             fullWidth
//             value={componentConfig[propName]}
//             onChange={(e, value) => handleChange(value, propName)}
//             renderInput={(params) => (
//               <TextField {...params} variant="standard" placeholder="Options" />
//             )}
//           />
//         </Box>
//       );
//     }

//     case "sx": {
//       const sx = componentConfig.sx || {};
//       return (
//         <Box className="column gap-1 p-2 custom_styling_cont mt-">
//           <Box className="flex-center custom_styling_box">
//             <Typography className="w-50">Color</Typography>
//             <input
//               type="color"
//               onChange={(e) =>
//                 handleChange({ ...sx, color: e.target.value }, "sx")
//               }
//             />
//           </Box>
//           <Box className="flex-center custom_styling_box">
//             <Typography className="w-50">Background Color</Typography>{" "}
//             <input
//               type="color"
//               onChange={(e) =>
//                 handleChange({ ...sx, backgroundColor: e.target.value }, "sx")
//               }
//             />
//           </Box>
//           <Box className="flex-center custom_styling_box">
//             <Typography className="w-50">Font Size</Typography>{" "}
//             <span>
//               <input
//                 type="number"
//                 onChange={(e) =>
//                   handleChange(
//                     { ...sx, fontSize: `${e.target.value} px` },
//                     "sx"
//                   )
//                 }
//               />
//               &nbsp;px
//             </span>
//           </Box>
//           <Box className="flex-center custom_styling_box">
//             <Typography className="w-50">Padding</Typography>{" "}
//             <span>
//               <input
//                 type="number"
//                 onChange={(e) =>
//                   handleChange({ ...sx, padding: `${e.target.value}px` }, "sx")
//                 }
//               />
//               &nbsp;px
//             </span>
//           </Box>
//           <Box className="flex-center custom_styling_box">
//             <Typography className="w-50">font Weight</Typography>{" "}
//             <input
//               type="number"
//               onChange={(e) =>
//                 handleChange({ ...sx, fontWeight: e.target.value }, "sx")
//               }
//             />
//           </Box>
//         </Box>
//       );
//     }

//     case "color": {
//       return (
//         <Box className="flex-start-center gap-2">
//           {["primary", "secondary", "error", "success", "info"].map((color) => (
//             <Fab
//               key={color}
//               onClick={() => {
//                 handleChange(color, propName);
//               }}
//               size="small"
//               color={color}
//             />
//           ))}
//         </Box>
//       );
//     }

//     case "variant": {
//       const variants = DataforComponents[componentType]?.variants || [];
//       return (
//         <Select
//           value={componentConfig[propName] || variants[variants.length - 1]}
//         >
//           {variants?.map((element: string) => (
//             <MenuItem
//               key={element}
//               value={element}
//               onClick={() => handleChange(element, propName)}
//             >
//               {element}
//             </MenuItem>
//           ))}
//         </Select>
//       );
//     }

//     case "textAlign": {
//       const textAlign = DataforComponents[componentType]?.textAlignments || [];
//       return (
//         <Select
//           value={componentConfig[propName] || textAlign[textAlign.length - 1]}
//         >
//           {textAlign?.map((element: string) => (
//             <MenuItem
//               key={element}
//               value={element}
//               onClick={() => handleChange(element, propName)}
//             >
//               {element}
//             </MenuItem>
//           ))}
//         </Select>
//       );
//     }

//     case "data": {
//       return (
//         <TextField
//           className="textField"
//           multiline
//           type={allowedProps[propName] === "number" ? "number" : ""}
//           // value={JSON.stringify(componentConfig[propName])}
//           defaultValue={JSON.stringify(componentConfig[propName]) || ""}
//           onBlur={(e: any) =>
//             isJSONString(e?.target?.value)
//               ? handleChange(JSON.parse(e?.target?.value), propName)
//               : errorToast("Please enter a valid JSON")
//           }
//         />
//       );
//     }

//     case "type": {
//       const types = DataforComponents[componentType]?.type || [];
//       return (
//         <Select value={componentConfig[propName] || types[types.length - 1]}>
//           {types?.map((element: string) => (
//             <MenuItem
//               key={element}
//               value={element}
//               onClick={() => handleChange(element, propName)}
//             >
//               {element}
//             </MenuItem>
//           ))}
//         </Select>
//       );
//     }

//     case "flow": {
//       const triggerType = "webhook";
//       const createFlow = async () => {
//         const identifier = generateNewId(8);
//         const { data } = await createScripts({
//           project_id: projectId,
//           org_id: orgId,
//           title: `untitled-${componentId}`,
//           triggerDetails: { triggerType, type: "add" },
//           script: "//write your code here.",
//           identifier: `scri${identifier}`,
//         });
//         dispatch(
//           updateInterfaceActionStart({
//             gridId: gridId,
//             componentId,
//             actionsArr: [
//               ...(actionData?.actionsArr || []),
//               { type: "flow", eventType: "onClick", scriptId: data.data.id },
//             ],
//             actionId: actionData?._id || null,
//           })
//         );
//         dispatch(setConfigModalState({ isIframeOpen: true }));
//         openIframeInNewTab(data.data.id);
//         setActionType(null);
//       };

//       const openIframeInNewTab = function (scriptId: string) {
//         const url = `${process.env.REACT_APP_FRONTEND_URL}/projects/${orgId}/${projectId}/service/${triggerType}/workflows/${scriptId}/draft`;
//         const newTab = window.open(url, "_blank");
//         if (newTab) {
//           newTab.focus();
//         } else {
//           console.error(
//             "Popup blocked. Please enable popups for this website."
//           );
//         }
//       };
//       return (
//         <Box className="w-100 mb-3">
//           {actionElement?.scriptId ? (
//             <Button
//               key={actionElement.scriptId}
//               onClick={() => {
//                 dispatch(setConfigModalState({ isIframeOpen: true }));
//                 openIframeInNewTab(actionElement.scriptId);
//               }}
//               variant="light"
//               className="w-100 flex-start-center"
//             >
//               <WebhookIcon />
//               <Typography variant="h7" className="p-2">
//                 Open a Flow {actionElement?.scriptId}
//               </Typography>
//             </Button>
//           ) : (
//             <Button onClick={() => createFlow()} variant="contained">
//               {" Create a Flow"}{" "}
//             </Button>
//           )}
//         </Box>
//       );
//     }

//     case "navigate": {
//       const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setNavigateCheck((value) => !value);
//         dispatch(
//           updateInterfaceFrontendActionStart({
//             gridId: gridId,
//             componentId,
//             frontendActionId: actionKey || newId,
//             frontendActions: {
//               type: "navigate",
//               url: actionElement?.url || url,
//               openInNewTab: e?.target?.checked || false,
//             },
//           })
//         );
//       };
//       const saveUrl = (e: React.FocusEvent<HTMLInputElement>) => {
//         setUrl(e?.target?.value);
//         dispatch(
//           updateInterfaceFrontendActionStart({
//             gridId: gridId,
//             componentId,
//             frontendActionId: actionKey || newId,
//             frontendActions: {
//               type: "navigate",
//               url: e?.target?.value,
//               openInNewTab: isNavigateCheck,
//             },
//           })
//         );
//         setActionType(null);
//       };
//       return (
//         <Box className="flex-col gap-1 mb-3">
//           <Typography variant="h7">Navigate to</Typography>
//           <TextField
//             key={actionElement?._id}
//             id="outlined-multiline-static"
//             placeholder="Enter your Url"
//             multiline
//             maxRows={3}
//             onBlur={saveUrl}
//             defaultValue={actionElement?.url}
//             fullWidth
//             variant="filled"
//           />
//           <Box className="flex-start-center">
//             <Checkbox
//               onChange={handleChange}
//               checked={actionElement?.openInNewTab || false}
//             />
//             <Typography>Open in new Tab</Typography>
//           </Box>
//         </Box>
//       );
//     }
//     case "sendDataToFrontend": {
//       return (
//         <Box className="flex-center gap-1 mb-3">
//           <Typography variant="h7">Send Data to Frontend</Typography>
//         </Box>
//       );
//     }

//     case "alert": {
//       const saveMessage = (e: React.FocusEvent<HTMLInputElement>) => {
//         dispatch(
//           updateInterfaceFrontendActionStart({
//             gridId: gridId,
//             componentId,
//             frontendActionId: actionKey || newId,
//             frontendActions: { type: "alert", message: e?.target?.value },
//           })
//         );
//         setActionType(null);
//       };
//       return (
//         <Box className="flex-col gap-1 mb-3">
//           <Typography variant="h7">Alert Message</Typography>
//           <TextField
//             id="outlined-multiline-static"
//             placeholder="Enter your Message"
//             multiline
//             maxRows={3}
//             onBlur={saveMessage}
//             defaultValue={actionElement?.message || ""}
//             fullWidth
//             variant="filled"
//           />
//         </Box>
//       );
//     }
//     case "chatbot": {
//       const savePrompt = (e: React.FocusEvent<HTMLInputElement>) => {
//         const newValue = e?.target?.value; // Get the latest value
//         const isPromptPresent = actionData?.actionsArr?.some(
//           (action: any) => action.type === "chatbot"
//         );

//         const updatedActionsArr = isPromptPresent
//           ? actionData?.actionsArr.map((action: any) => {
//               if (action.type === "chatbot") {
//                 return { ...action, prompt: newValue };
//               }
//               return action;
//             })
//           : [
//               {
//                 type: "chatbot",
//                 eventType: "onClick",
//                 prompt: newValue,
//                 apiKey: "",
//               },
//             ];

//         dispatch(
//           updateInterfaceActionStart({
//             gridId: gridId,
//             componentId,
//             actionsArr: updatedActionsArr,
//             actionId: actionData?._id || null,
//           })
//         );
//         setActionType(null);
//       };

//       const saveApi = (e: React.FocusEvent<HTMLInputElement>) => {
//         const newValue = e?.target?.value; // Get the latest value
//         const isApiPresent = actionData?.actionsArr.some(
//           (action: any) => action.type === "chatbot"
//         );

//         const updatedActionsArr = isApiPresent
//           ? actionData?.actionsArr.map((action: any) => {
//               if (action.type === "chatbot") {
//                 return { ...action, apiKey: newValue };
//               }
//               return action;
//             })
//           : [
//               {
//                 type: "chatbot",
//                 eventType: "onClick",
//                 apiKey: newValue,
//                 prompt: "",
//               },
//             ];

//         dispatch(
//           updateInterfaceActionStart({
//             gridId: gridId,
//             componentId,
//             actionsArr: updatedActionsArr,
//             actionId: actionData?._id || null,
//           })
//         );
//         setActionType(null);
//       };

//       return (
//         <Box className="flex-col gap-1 mb-3">
//           <Typography variant="h7">Prompt</Typography>
//           <TextField
//             id="outlined-multiline-static"
//             placeholder="Enter your prompt"
//             multiline
//             maxRows={5}
//             minRows={3}
//             onBlur={savePrompt}
//             defaultValue={actionElement?.prompt}
//             fullWidth
//           />
//           <Divider className="my-2" />
//           <Typography variant="h7">API Key</Typography>
//           <TextField
//             id="outlined-multiline-static"
//             placeholder="Enter Api Key"
//             multiline
//             maxRows={5}
//             minRows={3}
//             onBlur={saveApi}
//             defaultValue={actionElement?.apiKey}
//             fullWidth
//           />
//         </Box>
//       );
//     }

//     case null:
//       return null;

//     default:
//       return (
//         <TextField
//           className="textField"
//           type={allowedProps[propName] === "number" ? "number" : ""}
//           value={componentConfig[propName]}
//           defaultValue={componentConfig[propName] || ""}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             handleChange(e?.target?.value, propName)
//           }
//         />
//       );
//   }
// }

// export default React.memo(
//   addUrlDataHoc(React.memo(ComponentToTakePropValue), [
//     ParamsEnums?.orgId,
//     ParamsEnums?.projectId,
//     ParamsEnums?.chatbotId,
//   ])
// );
