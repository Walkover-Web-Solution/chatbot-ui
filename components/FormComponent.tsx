import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

function FormComponent({ open, setOpen }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
  });

  const [errors, setErrors] = useState({
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
    const tempErrors = { name: "", email: "", number: "" };
    let isValid = true;

    if (!formData.name) {
      tempErrors.name = "Name is required";
      isValid = false;
    }
    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      tempErrors.email = "Invalid email address";
      isValid = false;
    }
    if (!formData.number) {
      tempErrors.number = "Number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.number)) {
      tempErrors.number = "Invalid number";
      isValid = false;
    }

    setErrors(tempErrors); // Make sure this sets the errors state correctly
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Handle form submission
      await axios.put(
        "https://api.phone91.com/client/",
        {
          n: formData.name,
          p: formData.number,
          e: formData.email,
          user_data: {},
          is_anon: false,
        },
        {
          headers: {
            authorization: "a13cc:673d8908a237d3ad372964a9",
            "content-type": "application/json",
          },
        }
      );
      setOpen(false); // Close the dialog after submission
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Enter your details</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name || " "} // Ensures empty helper text when no error
            fullWidth
            placeholder="Enter your name"
            InputProps={{
              style: { fontStyle: formData.name ? "normal" : "italic" },
            }}
          />
          <TextField
            name="email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email || " "} // Ensures empty helper text when no error
            fullWidth
            placeholder="Enter your email"
            InputProps={{
              style: { fontStyle: formData.email ? "normal" : "italic" },
            }}
          />
          <TextField
            name="number"
            variant="outlined"
            value={formData.number}
            onChange={handleChange}
            error={!!errors.number}
            helperText={errors.number || " "} // Ensures empty helper text when no error
            fullWidth
            placeholder="Enter your number"
            InputProps={{
              style: { fontStyle: formData.number ? "normal" : "italic" },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className="w-100"
          >
            Submit
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FormComponent;