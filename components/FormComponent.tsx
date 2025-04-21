import { saveClientDetails } from "@/config/helloApi";
import { isColorLight } from "@/utils/themeUtility";
import { useTheme } from "@mui/material";
import { Mail, Phone, Send, User } from "lucide-react";
import { useState } from "react";

interface FormComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  number: string;
}

interface FormErrors {
  name: string;
  email: string;
  number: string;
}

function FormComponent({ open, setOpen }: FormComponentProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.primary.main;
  const textColor = isColorLight(backgroundColor) ? "black" : "white";
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    number: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error on change
  };

  const validate = () => {
    const tempErrors: FormErrors = { name: "", email: "", number: "" };
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
        p: formData.number,
        e: formData.email || "demo@gmail.com",
        user_data: {},
        is_anon: false,
      }
      saveClientDetails(clientData).then(() => {
        setOpen(false);
      })
    }
  };

  if (!open) return null;
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
                className={`input input-bordered w-full pl-10`}
              />
            </div>
          </div>

          {/* Phone number field */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Phone Number</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Phone size={18} />
              </div>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={`input input-bordered w-full pl-10`}
              />
            </div>
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