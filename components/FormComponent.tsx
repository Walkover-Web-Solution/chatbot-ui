import countryCodes from "@/assests/countryCode.json";
import { saveClientDetails } from "@/config/helloApi";
import { addUrlDataHoc } from "@/hoc/addUrlDataHoc";
import { setOpenHelloForm } from "@/store/chat/chatSlice";
import { setHelloClientInfo, setHelloKeysData } from "@/store/hello/helloSlice";
import { GetSessionStorageData } from "@/utils/ChatbotUtility";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { splitNumber } from "@/utils/utilities";
import { BookText, Loader2, Mail, Phone, Send, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useColor } from "./Chatbot/hooks/useColor";
import { useScreenSize } from "./Chatbot/hooks/useScreenSize";

interface FormComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  chatSessionId: string
}

interface FormData {
  name: string;
  email: string;
  number: string;
  countryCode: string;
}

interface FormErrors {
  name: string;
  email: string;
  number: string;
  countryCode: string;
}

function FormComponent({ chatSessionId }: FormComponentProps) {
  const { textColor, backgroundColor } = useColor();
  const dispatch = useDispatch();
  const { showWidgetForm, open, userData } = useCustomSelector((state) => ({
    showWidgetForm: state.Hello?.[chatSessionId]?.showWidgetForm ?? true,
    open: state.Chat.openHelloForm,
    userData: state.Hello?.[chatSessionId]?.clientInfo
  }));
  const scriptParams = JSON.parse(GetSessionStorageData('helloConfig') || '{}')
  console.log('form')
  const { isSmallScreen } = useScreenSize();
  const [formData, setFormData] = useState<FormData>({
    name: userData?.Name || "",
    email: userData?.Email || "",
    number: splitNumber(userData?.Phonenumber || "")?.number || "",
    countryCode: splitNumber(userData?.Phonenumber || "")?.code || "+91"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    number: "",
    countryCode: ""
  });

  useEffect(() => {
    setFormData({ ...formData, name: userData?.Name || "", email: userData?.Email || "", number: splitNumber(userData?.Phonenumber || "")?.number || "", countryCode: splitNumber(userData?.Phonenumber || "")?.code || "+91" });
  }, [userData]);

  const setOpen = (open: boolean) => {
    dispatch(setOpenHelloForm(open));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error on change
  };

  const validate = () => {
    const tempErrors: FormErrors = { name: "", email: "", number: "", countryCode: "" };
    let isValid = true;

    if (!formData.name) {
      tempErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.length > 26) {
      tempErrors.name = "Name cannot exceed 26 characters";
      isValid = false;
    }

    // Email is optional, but validate if present
    if (formData.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      tempErrors.email = "Invalid email address";
      isValid = false;
    }

    // Number is optional, but validate if present
    if (formData.number && !/^\d{10}$/.test(formData.number)) {
      tempErrors.number = "Invalid number";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      let clientData = {
        Name: formData?.name,
        Phonenumber: formData?.number ? `${formData?.countryCode}${formData?.number}` : undefined,
        Email: formData?.email
      }

      // Dispatch setHelloKeysData if all three fields are filled
      if (formData.name && formData.email && formData.number) {
        dispatch(setHelloKeysData({ showWidgetForm: false }));
      }

      saveClientDetails(clientData).then(() => {
        setOpen(false);
        dispatch(setHelloClientInfo({ clientInfo: { ...clientData } }));
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      })
    }
  };

  if (!open && !showWidgetForm) return null;
  if (!open && showWidgetForm) return (
    <div
      className={`bg-white p-2 px-4 cursor-pointer z-[9999] hover:shadow-md transition-all mx-auto rounded-br-md rounded-bl-md ${isSmallScreen ? 'w-full' : 'w-1/2 max-w-lg'}`}
      onClick={() => setOpen(true)}
      style={{
        background: `linear-gradient(to right, ${backgroundColor}, ${backgroundColor}CC)`,
        color: textColor
      }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <BookText className="h-7 w-7 mr-1" />
        </div>
        <div className="ml-2">
          <span className="font-medium block">Enter your details</span>
          <p className="text-xs opacity-80">Click here to provide your information</p>
        </div>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Card header */}
        <div className="bg-primary text-white p-6 rounded-t-lg" style={{
          background: `linear-gradient(to right, ${backgroundColor}, ${backgroundColor}CC)`,
          color: textColor
        }}>
          <h2 className="text-xl font-bold">Enter your details</h2>
          <p className="text-sm opacity-90 mt-1">
            Please provide your information below
          </p>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name field */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Name *</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={scriptParams?.name ? true : false}
                className={`input input-bordered w-full pl-10 ${errors.name ? "input-error" : ""
                  }`}
                required
              />
            </div>
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.name}</span>
              </label>
            )}
          </div>

          {/* Email field */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={scriptParams?.mail ? true : false}
                placeholder="Enter your email"
                className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""}`}
              />
            </div>
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </label>
            )}
          </div>

          {/* Phone number field */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Phone Number</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={`select select-bordered select-md max-w-36 pl-10 ${errors.countryCode ? "select-error" : ""}`}
                  style={{ width: 'auto' }}
                >
                  {countryCodes
                    .filter(country => country.dial_code !== null && country.dial_code !== "")
                    .map((country) => (
                      <option key={country.code + country.dial_code} value={String(country.dial_code)}>
                        {country.code} ({country.dial_code})
                      </option>
                    ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Phone size={18} />
                </div>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  disabled={scriptParams?.number ? true : false}
                  placeholder="Enter your phone number"
                  className={`input input-bordered w-full ${errors.number ? "input-error" : ""}`}
                />
              </div>
            </div>
            {errors.number && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.number}</span>
              </label>
            )}
          </div>

          {/* Submit button */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="btn btn-outline flex-1"
              onClick={() => setOpen(false)}
            >
              Skip
            </button>
            <button
              disabled={isLoading}
              type="submit"
              className="btn flex-1"
              style={{
                opacity: isLoading ? 0.5 : 1,
                backgroundColor: backgroundColor,
                color: textColor
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send size={18} className="mr-2" />
                  Submit
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(addUrlDataHoc(FormComponent));