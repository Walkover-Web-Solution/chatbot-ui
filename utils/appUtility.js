import { Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";

function CustomSuspense({ children }) {
  return <Suspense fallback={<CircularProgress />}>{children}</Suspense>;
}

// utils/supportsLookbehind.js
export function supportsLookbehind() {
  try {
    new RegExp("(?<= )");
    return true;
  } catch (err) {
    return false;
  }
}

export default CustomSuspense;
