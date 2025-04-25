import { Box, Typography } from "@mui/material";
import { customAlphabet } from "nanoid";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const generateNewId = (length = 8) => {
  const nanoid = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    length
  );
  return nanoid();
};

export const Notes = {
  response: (
    <Box className="p-3 mt-3 notes-bg">
      <Typography className="font-bold">
        Avoid initializing Variables 📌
      </Typography>
      <Typography>
        Always initialize variable outside of response block to prevent
        unexpected errors{" "}
      </Typography>
      <br />
      <Typography className="font-bold">Keep Functions Simple ➖</Typography>
      <Typography>
        When adding functions, make them short, ideally one line, to prevent
        mistakes and make your code easy to read.👓📝
      </Typography>
      <br />
      <Typography className="font-bold">
        Return What&apos;s Needed 📉
      </Typography>
      <Typography>
        Only include necessary data in the response to minimize processing and
        transfer overhead. Leave out unnecessary information. 🚀✨
      </Typography>
    </Box>
  ),
  function: (
    <Box className="p-3 notes-bg mt-3">
      <Typography className="font-bold">Syntax 📝</Typography>
      <Typography>Just include the core code of the function.</Typography>
      <br />
      <Typography className="font-bold">Supported Libraries 📚</Typography>
      <Typography>
        moment, axios, FormData, https, fetch and crypto are supported inside
        the function.
      </Typography>
      <Typography
        className="info-color flex-start-center gap-1"
        onClick={() => {
          window.open(
            "https://dev-interface.viasocket.com/i/65f01b9b4bc027b8ec12a2ed"
          );
        }}
      >
        Click for more details
        <OpenInNewIcon fontSize="small" />
      </Typography>
      <br />
      <Typography className="font-bold">Logging Messages</Typography>
      <Typography>
        The console allows developers to output messages from their code, which
        can help in debugging and understanding how the code is running.
      </Typography>
      <br />
      <Typography className="font-bold">Read Blog 📚🔍</Typography>
      <Typography>
        For more information, please read our{" "}
        <a
          rel="noreferrer"
          href="https://viasocket.com/faq/functions"
          target="_blank"
        >
          blog.
        </a>
      </Typography>
    </Box>
  ),
  variable: (
    <Box className="notes-bg p-3 mt-3">
      <Typography className="font-bold">How to Write 📝</Typography>
      <Typography>
        Use regular javascript syntax to assign values to variables. For text,
        use quotes like &quot;name&quot;.
      </Typography>
      <br />
      <Typography className="font-bold">Start Simple</Typography>
      <Typography>
        Create variables with the necessary information, without adding extra
        code.
      </Typography>
      <br />
      <Typography className="font-bold">Use Anywhere 🌐</Typography>
      <Typography>
        Once initialized, you can use these variables anywhere you need, like in
        functions, API calls, or conditions.
      </Typography>
      <br />
      <Typography className="font-bold">Read Blog 📚🔍</Typography>
      <Typography>
        For more information, please read our{" "}
        <a
          rel="noreferrer"
          href="https://viasocket.com/faq/variable-customizations"
          target="_blank"
        >
          blog.
        </a>
      </Typography>
    </Box>
  ),
  if: (
    <Box className="p-3 mt-3 notes-bg">
      <Typography className="font-bold">Check a Condition First ✔️</Typography>
      <Typography>
        Before doing something, make sure a condition is met, like checking if
        something is true: value === true.
      </Typography>
      <br />
      <Typography className="font-bold">Any Type of Check 🔄</Typography>
      <Typography>
        This check can be for anything - a number, text, or something stored in
        a variable you made before.
      </Typography>
      <br />
      <Typography className="font-bold">Use JavaScript Rules 📜 </Typography>
      <Typography>
        Write these checks using regular JavaScript rules, just like you
        normally would.
      </Typography>
      <br />
      <Typography className="font-bold">Read Blog 📚🔍</Typography>
      <Typography>
        For more information, please read our{" "}
        <a
          rel="noreferrer"
          href="https://viasocket.com/faq/conditional-logic"
          target="_blank"
        >
          blog.
        </a>
      </Typography>
    </Box>
  ),
  transferOptionNotes: (
    <Box className="p-3 mt-3 notes-bg">
      <Typography className="font-bold">
        Match Function Output to Input Format 🔄
      </Typography>
      <Typography>
        Function&apos;s output format will be same as the value&apos;s format
        passed through flow for trigger activation{" "}
      </Typography>
    </Box>
  ),
  cron: (
    <Box className="p-3 mt-3 notes-bg">
      <Typography className="font-bold">Be Clear 🗣</Typography>
      <Typography>
        Use simple and clear terms when setting up your schedule.
      </Typography>
      <br />
      <Typography className="font-bold">Match Your Needs 🎯</Typography>
      <Typography>
        {" "}
        Make sure your schedule&apos;s description clearly states what you need
        it to do.
      </Typography>
      <br />
      <Typography className="font-bold">Timing ⏱</Typography>
      <Typography>
        Cron jobs can only run every minute at the least, not more often.
      </Typography>
      <br />
      <Typography className="font-bold">Read Blog 📚🔍</Typography>
      <Typography>
        For more information, please read our{" "}
        <a
          rel="noreferrer"
          href=" https://viasocket.com/faq/scheduled-tasks"
          target="_blank"
        >
          blog.
        </a>
      </Typography>
    </Box>
  ),
  emailToFlow: (
    <Box className="p-3 mt-3 notes-bg">
      <Typography className="font-bold">Automate Flow ✉️✨</Typography>
      <Typography>Forward emails to this flow you want to automate</Typography>
      <br />
      <Typography className="font-bold">
        Smart Filtering for Targeted Forwarding 🎯
      </Typography>
      <Typography>
        Enable forwarding for specific emails effortlessly by applying filters,
        such as those containing resumes or originating from specific IDs.
      </Typography>
      <br />
      <Typography className="font-bold">Read Blog 📚🔍</Typography>
      <Typography>
        For more information, please read our{" "}
        <a
          rel="noreferrer"
          href="https://viasocket.com/faq/email-to-flow"
          target="_blank"
        >
          blog.
        </a>
      </Typography>
    </Box>
  ),
  API: (
    <Box className="p-3 mt-3 notes-bg">
      <Typography className="font-bold">API Basics 🔄</Typography>
      <Typography>
        APIs help software talk to each other without needing to know complex
        code
      </Typography>
      <br />
      <Typography className="font-bold">Custom API Control 🛠️</Typography>
      <Typography>
        With viaSocket&apos;s Custom API, you can easily make specific requests
        for tasks like getting or changing data
      </Typography>
      <br />
      <Typography className="font-bold">Streamlined Workflows</Typography>
      <Typography>
        viaSocket&apos;s Custom API automates tasks, making work faster and
        easier.
      </Typography>
      <br />
      <Typography className="font-bold">Read Blog 📚🔍</Typography>
      <Typography>
        For more information, please read our{" "}
        <a
          rel="noreferrer"
          href="https://viasocket.com/faq/custom-api-integration"
          target="_blank"
        >
          blog.
        </a>
      </Typography>
    </Box>
  ),
};

function getDomain() {
  const hostname = window.location.hostname;
  const parts = hostname?.split(".");
  if (parts.length >= 2) {
    parts.shift(); // Remove the subdomain part
    return `.${parts.join(".")}`;
  }
  return hostname;
}

export const getSubdomain = () => {
  return window.location.hostname;
};

export const getCurrentEnvironment = () =>
  process.env.REACT_APP_API_ENVIRONMENT;

export const setInCookies = (key, value) => {
  const domain = getDomain();
  let expires = "";

  const date = new Date();
  date.setTime(date.getTime() + 2 * 24 * 60 * 60 * 1000);
  expires = `; expires= ${date.toUTCString()}`;
  document.cookie = `${key}=${value || ""}${expires}; domain=${domain}; path=/`;
};

function splitFromFirstEqual(str) {
  // Handle empty string or string without an equal sign gracefully
  if (!str || str.indexOf("=") === -1) {
    return [str, ""]; // Return the original string as both parts
  }

  // Find the index of the first equal sign
  const index = str.indexOf("=");

  // Handle cases where the equal sign is at the beginning or end of the string
  if (index === 0) {
    return ["", str.slice(1)]; // Empty key, value is the rest of the string
  }
  if (index === str.length - 1) {
    return [str.slice(0, -1), ""]; // Key is the entire string except the last character (equal sign)
  }

  // Split the string into key and value parts
  const key = str.slice(0, index);
  const value = str.slice(index + 1);

  return [key, value];
}

export const getFromCookies = (cookieId) => {
  // Split cookies string into individual cookie pairs and trim whitespace
  const cookies = document.cookie?.split(";").map((cookie) => cookie.trim());
  // Loop through each cookie pair
  for (let i = 0; i < cookies.length; i++) {
    // const cookiePair = cookies[i]?.split('=');
    // If cookie name matches, return its value
    const [key, value] = splitFromFirstEqual(cookies[i]);
    if (cookieId === key) {
      return value;
    }
  }
  // If the cookie with the given name doesn't exist, return null
  return null;
};

export const removeCookie = (cookieName) => {
  const domain = getDomain();
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
};