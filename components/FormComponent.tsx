import { saveClientDetails } from "@/config/helloApi";
import { setHelloKeysData } from "@/store/hello/helloSlice";
import { $ReduxCoreType } from "@/types/reduxCore";
import { useCustomSelector } from "@/utils/deepCheckSelector";
import { isColorLight } from "@/utils/themeUtility";
import { useTheme } from "@mui/material";
import { Mail, Phone, Send, User } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import countryCodes from "@/assests/countryCode.json";

interface FormComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isSmallScreen: boolean;
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

function FormComponent({ open, setOpen, isSmallScreen }: FormComponentProps) {
  const theme = useTheme();
  const { showWidgetForm } = useCustomSelector((state: $ReduxCoreType) => ({
    showWidgetForm: state.Hello.showWidgetForm
  }));
  const dispatch = useDispatch();
  const backgroundColor = theme.palette.primary.main;
  const textColor = isColorLight(backgroundColor) ? "black" : "white";
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    number: "",
    countryCode: "+91"
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    number: "",
    countryCode: ""
  });

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
      const clientData = {
        n: formData.name,
        p: formData.number ? `${formData.countryCode}${formData.number}` : undefined,
        e: formData.email || "demo@gmail.com",
        user_data: {},
        is_anon: false,
      }

      // Dispatch setHelloKeysData if all three fields are filled
      if (formData.name && formData.email && formData.number) {
        dispatch(setHelloKeysData({ showWidgetForm: false }));
      }

      saveClientDetails(clientData).then(() => {
        setOpen(false);
      })
    }
  };

  if (!open && !showWidgetForm) return null;
  if (!open && showWidgetForm) return (
    <div
      className={`bg-white p-2 px-4 cursor-pointer hover:shadow-xl transition-all borde border-gray-300 mx-auto ${isSmallScreen ? 'w-full' : 'w-1/2 max-w-lg'}`}
      onClick={() => setOpen(true)}
      style={{
        backgroundColor: backgroundColor,
        color: textColor
      }}
    >
      <div className="flex items-center gap-2">
        <User size={18} />
        <span className="font-medium">Enter your details</span>
      </div>
      <p className="text-xs mt-1 opacity-80">Click here to provide your information</p>
    </div>
  );
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Card header */}
        <div className="bg-primary text-white p-6 rounded-t-lg" style={{
          backgroundColor: backgroundColor,
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
            <div className="flex gap-2">
              <div className="relative">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className={`select select-bordered pl-10 ${errors.countryCode ? "select-error" : ""}`}
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
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
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
              type="submit"
              className="btn flex-1"
              style={{
                backgroundColor: backgroundColor,
                color: textColor
              }}
            >
              <Send size={18} className="mr-2" />
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormComponent;