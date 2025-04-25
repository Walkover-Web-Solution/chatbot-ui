import { Typography, TypographyProps } from "@mui/material";

interface InterfaceTextProps {
  props: TypographyProps | any;
}

function InterfaceText({ props }: InterfaceTextProps) {
  // const dispatch = useDispatch();
  // const responseJson = useContext(GridContext);
  // useEffect(() => {
  //   dispatch(
  //     addInterfaceContext({
  //       gridId: responseJson?.responseId + responseJson?.msgId,
  //       componentId: componentId,
  //       value: responseJson?.[componentId]?.props?.children,
  //     })
  //   );
  // }, [responseJson, responseJson?.msgId]);

  return (
    <Typography key={props?.key} {...props}>
      {props?.children || `I'm a text component.`}
    </Typography>
  );
}

export default InterfaceText;
