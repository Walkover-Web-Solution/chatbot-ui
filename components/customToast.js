import { createRoot } from "react-dom/client";
import Snackbar from "@mui/material/Snackbar";
import { Alert, AlertTitle, IconButton } from "@mui/material";
import Slide from "@mui/material/Slide";
import CloseIcon from "@mui/icons-material/Close";

let id = 0;
let closedId = 0;
const isRendering = {};
const createAlertContainer = () => {
  let container = document.getElementById(`alert-container-${id}`);
  if (!container) {
    container = document.createElement("div");
    container.id = `alert-container-${id}`;
    document.body.appendChild(container);
  }
  return container;
};
function SlideTransition(props) {
  return <Slide {...props} direction="right" />;
}

export function showSnackbar(alert) {
  if (isRendering[`${alert.severity}${alert.message}`]) return;
  isRendering[`${alert.severity}${alert.message}`] = true;
  const alertContainer = createAlertContainer();

  const closeAlert = () => {
    root.unmount();
    closedId++;
    if (id === closedId) {
      id = 0;
      closedId = 0;
    }
    delete isRendering[`${alert.severity}${alert.message}`];
  };

  const root = createRoot(alertContainer);

  const CustomToastComponent = (
    <Snackbar
      sx={{ marginBottom: `${80 * (id % 12)}px` }} // inline css was required.
      TransitionComponent={SlideTransition}
      open
    >
      <Alert
        variant="filled"
        severity={alert.severity}
        action={
          <IconButton color="inherit" size="small" onClick={closeAlert}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>{alert.severity}</AlertTitle>
        {alert.message}
      </Alert>
    </Snackbar>
  );

  root.render(CustomToastComponent);
  id++;
  setTimeout(() => {
    closeAlert();
  }, 3000);
}

export function successToast(message) {
  showSnackbar({ severity: "success", message });
}

export function errorToast(message) {
  showSnackbar({ severity: "error", message });
}

export function warningToast(message) {
  showSnackbar({ severity: "warning", message });
}

export function infoToast(message) {
  showSnackbar({ severity: "info", message });
}
